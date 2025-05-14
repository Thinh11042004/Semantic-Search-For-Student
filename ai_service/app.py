import os
import logging
from fastapi import FastAPI, Body, Query
from sentence_transformers import SentenceTransformer
import psycopg2
from PyPDF2 import PdfReader
import docx 
from fastapi.responses import JSONResponse
from typing import Union, List
import numpy as np
import logging
import re


# Tạo thư mục logs nếu chưa có
if not os.path.exists("logs"):
    os.makedirs("logs")

# Thiết lập ghi log
logging.basicConfig(
    filename="logs/upload.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app = FastAPI()
model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")  # 768 chiều 



# Kết nối PostgreSQL
conn = psycopg2.connect(
    host="semantic_search_db",  
    port=5432,
    user="admin",
    password="123456",
    database="StudentFormDB"
)
cursor = conn.cursor()

# Helper function để đọc file PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PdfReader(file)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
    return text

# Helper function để đọc file DOCX
def extract_text_from_docx(docx_path):
    doc = docx.Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs])


# Hàm kiểm tra xem tên file đã tồn tại trong cơ sở dữ liệu chưa (Đây là phần thay đổi)
def is_file_exists(title):  
    cursor.execute("SELECT COUNT(*) FROM forms WHERE title = %s", (title,))
    count = cursor.fetchone()[0]
    return count > 0  # Nếu count > 0, nghĩa là file đã tồn tại



# Hàm xóa tất cả các bản ghi trùng tên file
def delete_duplicate_files():
    try:
        cursor.execute("""
            DELETE FROM forms
            WHERE ctid NOT IN (
                SELECT min(ctid)
                FROM documents
                GROUP BY title
            );
        """)  # Xóa tất cả các bản ghi trùng, chỉ giữ lại bản ghi đầu tiên có cùng title
        conn.commit()
        logging.info("Đã xóa tất cả các bản ghi trùng tên file.")
    except Exception as e:
        logging.error(f"Lỗi khi xóa file trùng: {e}")
        conn.rollback()


# Hàm upload file (dùng chung cho API và auto load)
def upload_file_to_db(file_path):
    title = os.path.basename(file_path)
    
    if is_file_exists(title):  # Nếu file đã tồn tại
        logging.info(f"File '{title}' đã tồn tại. Xóa file trùng...")
        delete_duplicate_files()  # Xóa file trùng
    
    content = ""
    if file_path.endswith(".pdf"):
        content = extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        content = extract_text_from_docx(file_path)
    else:
        logging.warning(f"Bỏ qua file không hỗ trợ: {file_path}")
        return {"error": "Unsupported file type"}
    
    embedding = model.encode(content).tolist()
    
    try:
        cursor.execute(
            "INSERT INTO forms (title, content, embedding) VALUES (%s, %s, %s)",
            (title, content, embedding)
        )
        conn.commit()
        logging.info(f"Uploaded: {title}")
        return {"status": "uploaded", "title": title}
    except Exception as e:
        logging.error(f"Lỗi khi upload file: {e}")
        conn.rollback()
        return {"error": f"Failed to upload file: {e}"}


@app.get("/search")
def semantic_search(
    query: str = Query(..., description="Câu truy vấn tìm kiếm"),
    top_k: int = Query(5, description="Số lượng kết quả muốn trả về")
):
    """
    ✅ API Semantic Search nâng cao:
    - Mã hóa truy vấn bằng S-BERT
    - Tính độ tương đồng cosine
    - Lọc đoạn văn phù hợp
    - Gợi ý fallback nếu không có đoạn chứa từ khóa
    - Trả lý do + điểm số cho từng kết quả
    """
    logging.info(f"🔍 Semantic search: {query}")
    try:
        # ✅ 1. Mã hóa truy vấn bằng S-BERT
        query_vec = model.encode(query).tolist()

        # ✅ 2. Truy vấn dữ liệu từ DB
        cursor.execute("SELECT title, content, embedding FROM forms")
        rows = cursor.fetchall()

        def cosine_similarity(a, b):
            # ✅ 3. Ép kiểu an toàn sang float32 (SỬA MỚI)
            a = np.array(a, dtype=np.float32)
            b = np.array(eval(b), dtype=np.float32) if isinstance(b, str) else np.array(b, dtype=np.float32)
            return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

        scored = []
        for title, content, embedding in rows:
            try:
                score = cosine_similarity(query_vec, embedding)
                scored.append((title, content, score))
            except Exception as vector_err:
                logging.warning(f"⚠️ Bỏ qua vector lỗi: {vector_err}")
                continue

        if not scored:
            return JSONResponse(status_code=404, content={"message": "Không tìm thấy kết quả phù hợp."})

        # ✅ 4. Lấy top_k kết quả theo điểm
        top_results = sorted(scored, key=lambda x: x[2], reverse=True)[:top_k]

        final_results = []
        for title, content, score in top_results:
            sentences = re.split(r'[.?!]\s+', content)
            matched = [s for s in sentences if query.lower() in s.lower()]
            snippet = " ".join(matched)[:300] + "..." if matched else content[:300] + "..."
            final_results.append({
                "title": title,
                "snippet": snippet,
                "similarity_score": round(score, 4),
                "reason": "Tìm thấy câu chứa từ khóa truy vấn" if matched else "Gợi ý theo độ tương đồng ngữ nghĩa"
            })

        return {
            "query": query,
            "top_matches": final_results
        }

    except Exception as e:
        logging.error(f"❌ Search error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Search failed", "detail": str(e)}
        )

#API Top-K tìm kiếm k biểu mẫu
@app.post("/top-k")
def top_k_search(query: str = Body(...), k: int = Body(...)):
    logging.info(f"🔍 Đang tìm kiếm với truy vấn: {query}, Top {k} kết quả")

    try:
        # Mã hóa truy vấn thành vector
        query_embedding = model.encode(query).tolist()  # Chuyển đổi thành Python list

        # Truy vấn PostgreSQL để lấy top-K kết quả tìm kiếm
        cursor.execute("""
            SELECT title, content
            FROM forms
            ORDER BY embedding <=> %s::vector  -- So sánh vector
            LIMIT %s;
        """, (query_embedding, k))  # Truyền vào query_embedding dưới dạng list và k

        results = cursor.fetchall()
        
        # Trả về kết quả
        if results:
            return {
                "query": query,
                "top_k_results": [
                    {"title": result[0], "content": result[1][:500] + "..."} for result in results
                ]
            }
        else:
            return {
                "query": query,
                "message": f"Không tìm thấy {k} biểu mẫu phù hợp."
            }
    except Exception as e:
        logging.error(f"Lỗi trong quá trình tìm kiếm: {e}")
        cursor.execute("ROLLBACK;")  # Hủy giao dịch nếu có lỗi
        return {"error": f"Top-K search failed: {e}"}



# ✅ API: Nhận văn bản, trả  vector
@app.post("/get-embedding")
def get_embedding(text: Union[str, List[str]] = Body(...)):
  
    try:
        if isinstance(text, str):
            text = [text]
        text = [t[:5000] for t in text]  # Giới hạn văn bản dài
        embeddings = model.encode(text).tolist()
        return {
            "embedding": embeddings[0] if len(embeddings) == 1 else embeddings
        }
    except Exception as e:
        logging.error(f"Lỗi khi sinh embedding: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Lỗi khi sinh embedding: {e}"}
        )
  