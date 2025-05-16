import os
import logging
import unicodedata  # hỗ trợ chuẩn hóa tiếng Việt không dấu
from fastapi import FastAPI, Body, Query
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer
import psycopg2
from PyPDF2 import PdfReader
import docx 
from typing import Union, List
import numpy as np
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

# Chuẩn hóa tiếng Việt (bỏ dấu, lowercase)
def normalize_text(text):
    """
    ✅ Chuẩn hóa tiếng Việt: bỏ dấu, chuyển về lowercase
    """
    text = unicodedata.normalize('NFD', text)
    text = ''.join([c for c in text if unicodedata.category(c) != 'Mn'])
    return text.lower()

# 🔧 MỚI: Mapping từ viết tắt hoặc tiếng Anh phổ biến
SYNONYM_MAP = {
    "hocbong": "học bổng",
    "hoclai": "học lại",
    "nghihoc": "nghỉ học",
    "report": "tường trình",
    "dt": "điện thoại",
    "sv": "sinh viên",
    "gv": "giảng viên",
    "cancel": "hủy",
    "apply": "xin",
    "form": "biểu mẫu",
}

def normalize_and_expand(text):
    """
    ✅ Chuẩn hóa + xử lý viết liền + dịch viết tắt/tiếng Anh
    """
    text = normalize_text(text.replace(" ", ""))
    return SYNONYM_MAP.get(text, text)

# Hàm kiểm tra xem tên file đã tồn tại trong cơ sở dữ liệu chưa
def is_file_exists(title):  
    cursor.execute("SELECT COUNT(*) FROM forms WHERE title = %s", (title,))
    count = cursor.fetchone()[0]
    return count > 0

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
        """)
        conn.commit()
        logging.info("Đã xóa tất cả các bản ghi trùng tên file.")
    except Exception as e:
        logging.error(f"Lỗi khi xóa file trùng: {e}")
        conn.rollback()

# Hàm upload file (dùng chung cho API và auto load)
def upload_file_to_db(file_path):
    title = os.path.basename(file_path)
    
    if is_file_exists(title):
        logging.info(f"File '{title}' đã tồn tại. Xóa file trùng...")
        delete_duplicate_files()
    
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

#API/ Search
@app.get("/search")
def semantic_search(
    query: str = Query(..., description="Câu truy vấn tìm kiếm"),
    top_k: int = Query(5, description="Số lượng kết quả muốn trả về")
):
    """
    🔍 Semantic search kết hợp từ khóa gần đúng, viết tắt, và vector ngữ nghĩa SBERT.
    """
    logging.info(f"🔍 Semantic search: {query}")
    try:
        # Mã hóa truy vấn thành vector
        query_vec = model.encode(query).tolist()

        # Chuẩn hóa truy vấn (không dấu, viết tắt, dịch tiếng Anh)
        query_clean = normalize_text(query)
        query_expanded = normalize_and_expand(query_clean)

        # Lấy toàn bộ biểu mẫu
        cursor.execute("SELECT id, title, content, embedding FROM forms")
        rows = cursor.fetchall()

        # Tính cosine similarity
        def cosine_similarity(a, b):
            a = np.array(a, dtype=np.float32)
            b = np.array(eval(b), dtype=np.float32) if isinstance(b, str) else np.array(b, dtype=np.float32)
            return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

        results = []

        for _id, title, content, embedding in rows:
            title_clean = normalize_text(title)
            content_clean = normalize_text(content)
            full_text = f"{title_clean} {content_clean}"

            if query_expanded in title_clean:
                score = 1.0
                reason = "🎯 Khớp gần đúng tiêu đề (không dấu)"
            elif query_expanded in full_text:
                score = 0.9
                reason = "📚 Khớp toàn văn (chuẩn hóa không dấu)"
            elif any(word in full_text for word in query_expanded.split()):
                score = 0.8
                reason = "📌 Có từ liên quan trong nội dung"
            else:
                score = cosine_similarity(query_vec, embedding)
                reason = "🤖 Khớp ngữ nghĩa (SBERT)"

            # Tạo snippet phù hợp
            sentences = re.split(r'[.?!]\s+', content)
            matched = [s for s in sentences if query_expanded in normalize_text(s)]
            snippet = " ".join(matched)[:300] + "..." if matched else content[:300] + "..."

            results.append({
                "id": _id,
                "title": title,
                "snippet": snippet,
                "similarity_score": round(score, 4),
                "reason": reason
            })

        # Trả về top-k theo score
        sorted_results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)

        return {
            "query": query,
            "results": sorted_results[:top_k] 
        }

    except Exception as e:
        logging.error(f"❌ Lỗi tìm kiếm: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Lỗi hệ thống", "detail": str(e)}
        )



@app.post("/top-k")
def top_k_search(query: str = Body(...), k: int = Body(...)):
    logging.info(f"🔍 Đang tìm kiếm với truy vấn: {query}, Top {k} kết quả")
    try:
        query_embedding = model.encode(query).tolist()
        cursor.execute("""
            SELECT title, content
            FROM forms
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        """, (query_embedding, k))
        results = cursor.fetchall()
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
        cursor.execute("ROLLBACK;")
        return {"error": f"Top-K search failed: {e}"}

@app.post("/get-embedding")
def get_embedding(text: Union[str, List[str]] = Body(...)):
    try:
        if isinstance(text, str):
            text = [text]
        text = [t[:5000] for t in text]
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
