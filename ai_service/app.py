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

# ===== CÁC HÀM HỖ TRỢ =====

def cosine_similarity(a, b):
    """
    ✅ Tính độ tương đồng cosine giữa 2 vector embedding
    """
    try:
        a = np.array(a, dtype=np.float32)
        b = np.array(eval(b), dtype=np.float32) if isinstance(b, str) else np.array(b, dtype=np.float32)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    except Exception as e:
        logging.error(f"Lỗi tính cosine similarity: {e}")
        return 0.0

def preprocess_query(query):
    """
    ✅ Tiền xử lý truy vấn: chuẩn hóa + mở rộng từ đồng nghĩa + xử lý viết liền
    """
    # Chuẩn hóa không dấu và lowercase
    clean_query = normalize_text(query)
    
    # Kiểm tra viết liền (trường hợp không có dấu cách)
    no_space_query = clean_query.replace(" ", "")
    
    # Dictionary mở rộng từ đồng nghĩa và viết tắt (bổ sung thêm)
    expanded_synonyms = {
        # Từ viết tắt phổ biến
        "hocbong": "học bổng",
        "hoclai": "học lại",
        "nghihoc": "nghỉ học",
        "chuyentruong": "chuyển trường",
        "thi": "kỳ thi",
        "thilai": "thi lại",
        "vang": "vắng",
        "thoihoc": "thôi học",
        "baoluu": "bảo lưu",
        "bangdiem": "bảng điểm",
        "giahan": "gia hạn",
        "hoanthi": "hoãn thi",
        "muon": "muộn",
        "donxin": "đơn xin",
        
        # Từ tiếng Anh -> tiếng Việt
        "report": "tường trình báo cáo",
        "cancel": "hủy bỏ",
        "application": "đơn xin",
        "form": "biểu mẫu đơn",
        "leave": "nghỉ",
        "absent": "vắng mặt",
        "transfer": "chuyển",
        "scholarship": "học bổng",
        "transcript": "bảng điểm",
        "makeup": "bù thi làm lại",
        "exam": "kỳ thi",
        "fee": "lệ phí",
        "tuition": "học phí",
        "withdraw": "rút",
        "delay": "hoãn trì",
        "suspend": "đình chỉ tạm ngưng",
        
        # Ngữ cảnh -> loại đơn
        "muốn nghỉ học": "đơn xin nghỉ học",
        "không đến trường": "đơn xin nghỉ học",
        "quên thi": "đơn xin thi lại",
        "không đi thi": "đơn xin hoãn thi",
        "không muốn học": "đơn xin thôi học",
        "chuyển trường": "đơn xin chuyển trường",
        "chậm nộp": "đơn xin gia hạn",
        "nộp muộn": "đơn xin nộp muộn",
        "vắng thi": "đơn xin hoãn thi",
        "học tiếp": "đơn xin tiếp tục học",
        "tạm dừng": "đơn xin bảo lưu"
    }
    
    # Kiểm tra từng phần tử trong từ điển mở rộng
    for key, value in expanded_synonyms.items():
        # Nếu từ khóa xuất hiện trong truy vấn đã chuẩn hóa
        if key in clean_query or key in no_space_query:
            return value  # Trả về dạng mở rộng
    
    # Nếu không có mở rộng nào phù hợp, trả về truy vấn gốc đã chuẩn hóa
    return clean_query

def create_snippet(content, query_clean, max_length=300):
    """
    ✅ Tạo đoạn trích phù hợp từ nội dung, ưu tiên phần chứa từ khóa
    """
    # Tách thành các câu
    sentences = re.split(r'[.!?]\s+', content)
    
    # Tìm các câu chứa từ khóa query
    query_terms = [term for term in query_clean.split() if len(term) > 2]
    matching_sentences = []
    
    for sentence in sentences:
        sentence_clean = normalize_text(sentence)
        if any(term in sentence_clean for term in query_terms):
            matching_sentences.append(sentence)
    
    # Nếu tìm thấy câu khớp, ghép lại thành đoạn trích
    if matching_sentences:
        snippet = " ".join(matching_sentences)
        if len(snippet) > max_length:
            return snippet[:max_length] + "..."
        return snippet
    
    # Nếu không tìm thấy câu nào khớp, lấy đoạn đầu
    return content[:max_length] + "..."

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
    top_k: int = Query(5, description="Số lượng kết quả muốn trả về"),
    min_score: float = Query(0.3, description="Điểm tương đồng tối thiểu để trả về kết quả")
):
    """
    🔍 Semantic search nâng cao kết hợp nhiều phương pháp:
    - So khớp tên file chính xác
    - So khớp tiêu đề biểu mẫu (có/không dấu, viết tắt)
    - So khớp nội dung biểu mẫu
    - Hiểu ngữ cảnh truy vấn bằng SBERT
    - Xử lý viết tắt, không dấu, và tiếng Anh
    """
    logging.info(f"🔍 Semantic search: {query}")
    try:
        # Chuẩn bị truy vấn
        original_query = query  # Lưu truy vấn gốc
        query = query.strip()
        
        # Nếu query quá ngắn (ít hơn 2 ký tự), trả về thông báo lỗi hoặc dữ liệu rỗng
        if len(query) < 2:
            return {
                "query": original_query,
                "results": []
            }
        
        # Tạo các biến thể của query để tìm kiếm
        query_clean = normalize_text(query)  # Không dấu
        query_no_space = normalize_text(query.replace(" ", ""))  # Không dấu + không space
        query_expanded = preprocess_query(query)  # Xử lý viết tắt, mở rộng từ đồng nghĩa
        
        # Mã hóa truy vấn thành vector
        query_vec = model.encode(query).tolist()
        
        # Lấy toàn bộ biểu mẫu
        cursor.execute("SELECT id, title, content, embedding FROM forms")
        rows = cursor.fetchall()
        
        if not rows:
            return {
                "query": original_query,
                "results": []
            }
        
        results = []
        
        for _id, title, content, embedding in rows:
            # Chuẩn hóa dữ liệu
            title_clean = normalize_text(title)  # Tiêu đề không dấu
            title_no_space = normalize_text(title.replace(" ", ""))  # Tiêu đề không dấu + không space
            content_clean = normalize_text(content)  # Nội dung không dấu
            
            # Tính điểm tương đồng ngữ nghĩa
            semantic_score = cosine_similarity(query_vec, embedding)
            
            # 1. Khớp tên file chính xác
            if query_no_space == title_no_space:
                match_score = 1.0
                match_reason = "🎯 Khớp chính xác với tên file"
            
            # 2. Khớp tên file gần đúng 
            elif query_no_space in title_no_space:
                ratio = len(query_no_space) / len(title_no_space)
                # Nếu query chiếm phần lớn tên file (>70%)
                if ratio > 0.7:  
                    match_score = 0.95
                    match_reason = "🎯 Khớp gần đúng với tên file"
                else:
                    match_score = 0.85
                    match_reason = "📄 Tên file chứa từ khóa tìm kiếm"
            
            # 3. Khớp từ chính xác trong tiêu đề
            elif query_clean in title_clean.split():
                match_score = 0.9
                match_reason = "📋 Tiêu đề chứa từ khóa chính xác"
            
            # 4. Khớp với tiêu đề (dạng mở rộng)
            elif query_expanded in title_clean:
                match_score = 0.85
                match_reason = "📋 Tiêu đề chứa từ đồng nghĩa/mở rộng"
            
            # 5. Khớp một phần với tiêu đề
            elif any(word in title_clean for word in query_clean.split() if len(word) > 2):
                # Tính % từ quan trọng khớp với tiêu đề
                query_words = [w for w in query_clean.split() if len(w) > 2]
                title_words = title_clean.split()
                
                matching_words = sum(1 for w in query_words if any(w in t for t in title_words))
                word_match_ratio = matching_words / len(query_words) if query_words else 0
                
                match_score = 0.7 + (word_match_ratio * 0.2)  # 0.7-0.9 tùy % từ khớp
                match_reason = "📝 Một số từ khóa xuất hiện trong tiêu đề"
            
            # 6. Khớp nội dung văn bản
            elif any(kw in content_clean for kw in query_clean.split() if len(kw) > 2):
                # Đếm số từ khớp trong nội dung
                query_words = [w for w in query_clean.split() if len(w) > 2]
                matching_words = sum(1 for w in query_words if w in content_clean)
                word_match_ratio = matching_words / len(query_words) if query_words else 0
                
                content_score = 0.6 + (word_match_ratio * 0.2)  # 0.6-0.8 tùy % từ khớp
                
                # Trường hợp ngữ nghĩa cao
                if semantic_score > 0.7:
                    match_score = max(content_score, semantic_score)
                    match_reason = "🤖 Ngữ nghĩa SBERT + nội dung chứa từ khóa"
                else:
                    match_score = content_score
                    match_reason = "📚 Nội dung chứa từ khóa tìm kiếm"
            
            # 7. Khớp ngữ nghĩa (SBERT)
            else:
                match_score = semantic_score
                match_reason = "🤖 Khớp ngữ nghĩa (SBERT)"
            
            # Kết hợp điểm semantic và match để có điểm cuối cùng
            final_score = max(match_score, semantic_score * 0.95)
            
            # Chỉ thêm kết quả nếu điểm cao hơn ngưỡng
            if final_score >= min_score:
                # Tạo đoạn trích để hiển thị
                snippet = create_snippet(content, query_clean, max_length=300)
                
                results.append({
                    "id": _id,
                    "title": title,
                    "snippet": snippet,
                    "similarity_score": round(final_score, 4),
                    "reason": match_reason
                })
        
        # Trả về top-k kết quả theo điểm, hoặc ít hơn nếu không đủ kết quả đạt tiêu chuẩn
        sorted_results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)
        
        # Số lượng kết quả trả về phụ thuộc vào chất lượng match
        # Nếu kết quả đầu tiên có điểm rất cao (>0.9), có thể trả về ít kết quả hơn
        actual_top_k = top_k
        if sorted_results and sorted_results[0]["similarity_score"] > 0.9:
            # Tìm ngưỡng điểm giảm mạnh
            scores = [r["similarity_score"] for r in sorted_results[:top_k]]
            for i in range(1, len(scores)):
                if scores[i-1] - scores[i] > 0.3:  # Điểm giảm đột ngột
                    actual_top_k = i
                    break
        
        return {
            "query": original_query,
            "results": sorted_results[:actual_top_k] 
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