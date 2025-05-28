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
import difflib
from collections import Counter
import time  # 🆕 TÍCH HỢP: Để tính thời gian xử lý từ GocL4

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

# ===== CÁC HÀM HỖ TRỢ NÂNG CẤP HOÀN CHỈNH =====

# 🆕 TÍCH HỢP GocL4: Chuẩn hóa tiếng Việt nâng cao
def normalize_text(text):
    """
    🔧 TÍCH HỢP GocL4: Chuẩn hóa tiếng Việt toàn diện
    - Bỏ dấu và chuyển về lowercase  
    - Xử lý ký tự đặc biệt thông minh
    - Chuẩn hóa khoảng trắng tối ưu
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Chuẩn hóa Unicode NFD để tách dấu
    text = unicodedata.normalize('NFD', text)
    # Loại bỏ dấu thanh (Combining marks)
    text = ''.join([c for c in text if unicodedata.category(c) != 'Mn'])
    
    # Xóa các ký tự đặc biệt, giữ lại chữ cái, số và khoảng trắng
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # Chuẩn hóa khoảng trắng và chuyển về chữ thường
    text = re.sub(r'\s+', ' ', text.lower().strip())
    
    return text

# 🆕 TÍCH HỢP GocL4: SYNONYM_MAP mở rộng toàn diện
SYNONYM_MAP = {
    # === VIẾT TẮT PHỔ BIẾN - TÍCH HỢP GocL4 ===
    "hocbong": "học bổng",
    "hoclai": "học lại", 
    "nghihoc": "nghỉ học",
    "thoihoc": "thôi học rút khỏi trường",
    "chuyentruong": "chuyển trường",
    "chuyennganh": "chuyển ngành chuyển chuyên ngành",
    "bangdiem": "bảng điểm transcript",
    "donxin": "đơn xin đơn đề nghị",
    "baoluu": "bảo lưu tạm dừng học",
    "giahan": "gia hạn hoãn lại",
    "hoanthi": "hoãn thi dời lịch thi",
    "thilai": "thi lại làm lại bài thi",
    "vangmat": "vắng mặt absent",
    "muon": "muộn chậm trễ",
    "nopmuon": "nộp muộn submit late",
    "tamnghi": "tạm nghỉ nghỉ tạm thời",
    "tieptuc": "tiếp tục continue",
    "rut": "rút withdraw",
    "huy": "hủy cancel",
    "dinhchi": "đình chỉ suspend",
    "caplai": "cấp lại reissue",
    "xacnhan": "xác nhận confirm",
    "khentuong": "khen thưởng",
    "kyluat": "kỷ luật",
    "phoihop": "phối hợp",
    
    # === TIẾNG ANH -> TIẾNG VIỆT - TÍCH HỢP GocL4 ===
    "application": "đơn xin đơn đề nghị",
    "form": "biểu mẫu đơn",
    "report": "báo cáo tường trình",
    "cancel": "hủy bỏ",
    "leave": "nghỉ phép",
    "absent": "vắng mặt",
    "transfer": "chuyển đổi",
    "scholarship": "học bổng",
    "transcript": "bảng điểm",
    "makeup": "bù thi làm lại",
    "exam": "kỳ thi kiểm tra",
    "fee": "lệ phí",
    "tuition": "học phí",
    "withdraw": "rút khỏi",
    "delay": "hoãn lại",
    "suspend": "đình chỉ tạm ngưng",
    "extension": "gia hạn",
    "postpone": "hoãn lại",
    "reissue": "cấp lại",
    "confirm": "xác nhận",
    "continue": "tiếp tục",
    "temporary": "tạm thời",
    "permanent": "vĩnh viễn",
    
    # === NGỮ CẢNH VÀ Ý ĐỊNH - TÍCH HỢP GocL4 ===
    "khongmuonhoc": "thôi học rút khỏi trường",
    "muonnghihoc": "nghỉ học tạm dừng học", 
    "khongdentruong": "nghỉ học vắng mặt",
    "quenthi": "thi lại hoãn thi bù thi",
    "khongdithi": "hoãn thi vắng thi",
    "vangthi": "hoãn thi bù thi vắng thi",
    "muonchuyentruong": "chuyển trường",
    "chuyendi": "chuyển trường chuyển ngành chuyển điểm",
    "chamnop": "gia hạn nộp muộn",
    "nopmuon": "nộp muộn gia hạn",
    "hoctiep": "tiếp tục học bảo lưu",
    "tamdung": "bảo lưu tạm nghỉ",
    "tamnghi": "bảo lưu nghỉ học",
    "di": "điểm chuyển đi",
    "diem": "bảng điểm chuyển điểm",
    "hocthem": "học thêm song song",
    "haichuongtrinh": "học song song parallel",
    "caplai": "cấp lại reissue",
    "xacnhan": "xác nhận confirm",
    
    # === CẢM XÚC VÀ HOÀN CẢNH - TÍCH HỢP GocL4 ===
    "khongmuon": "thôi học chuyển trường nghỉ học",
    "chan": "thôi học chuyển ngành chuyển trường", 
    "metmoi": "nghỉ học bảo lưu",
    "khokhan": "học bổng gia hạn hoãn",
    "benh": "nghỉ học hoãn thi bảo lưu",
    "giadinh": "nghỉ học bảo lưu chuyển trường",
    "muonhoc": "tiếp tục học thêm chuyển ngành",
    "can": "học bổng xác nhận cấp lại",
    "thieu": "cấp lại bổ sung",
    
    # === VIẾT LIỀN VÀ VIẾT TẮT ĐẶC BIỆT - TÍCH HỢP GocL4 ===
    "donxinhepnghihoc": "đơn xin nghỉ học",
    "donxinthoihoc": "đơn xin thôi học",
    "donxinchuyentruong": "đơn xin chuyển trường",
    "donxinchuyennganh": "đơn xin chuyển ngành",
    "donxinhocbong": "đơn xin học bổng",
    "donxinbaoluu": "đơn xin bảo lưu",
    "donxingiahan": "đơn xin gia hạn",
    "bangdiemtotnghiep": "bảng điểm tốt nghiệp",
    "xacnhanhocsinh": "xác nhận học sinh",
    "xacnhansinhvien": "xác nhận sinh viên",
    
    # === GIỮ NGUYÊN TỪ Cl5Sonnet ===
    "chuyen": "chuyển",
    "chuyen di": "chuyển đi chuyển trường chuyển ngành chuyển điểm",
    "chuyendi": "chuyển đi chuyển trường chuyển ngành",
    "khongmuonhocnua": "thôi học chuyển trường",
    "muonhocnganhmoi": "chuyển ngành học thêm",
    "khongcodienthoai": "cập nhật thông tin liên lạc",
    "matdienthoai": "cập nhật thông tin",
    "doidiachi": "cập nhật thông tin cá nhân",
    "hocthem": "học hai chương trình song song",
    "hocthemnganh": "học hai chương trình song song",
    "khongthichnganhnaynua": "chuyển ngành",
    "muonchuyenkhoa": "chuyển ngành chuyển khoa",
    "bangdiemtotnghhiep": "bảng điểm tốt nghiệp",
    "hockhongduoc": "học lại bổ túc",
    "truotmon": "học lại thi lại",
    "ketmon": "kết thúc học phần",
    "dangkymon": "đăng ký học phần",
    "huymon": "hủy đăng ký học phần",
}

# 🆕 TÍCH HỢP GocL4: Bản đồ ngữ cảnh cảm xúc/ý định
CONTEXT_INTENT_MAP = {
    # === CẢM XÚC TIÊU CỰC ===
    "khong muon": ["thôi học", "chuyển trường", "nghỉ học", "rút khỏi"],
    "khong con": ["thôi học", "chuyển trường", "nghỉ học"],
    "chan": ["thôi học", "chuyển ngành", "chuyển trường", "nghỉ học"], 
    "met moi": ["nghỉ học", "bảo lưu", "tạm nghi"],
    "kho khan": ["học bổng", "gia hạn", "hoãn", "hỗ trợ"],
    "benh tat": ["nghỉ học", "hoãn thi", "bảo lưu", "gia hạn"],
    "gia dinh": ["nghỉ học", "bảo lưu", "chuyển trường", "hoãn"],
    "khong du": ["học bổng", "gia hạn", "hỗ trợ"],
    "qua kho": ["chuyển ngành", "bảo lưu", "nghỉ học"],
    
    # === Ý ĐỊNH TÍCH CỰC ===
    "muon hoc": ["tiếp tục", "học thêm", "chuyển ngành", "song song"],
    "can": ["học bổng", "xác nhận", "cấp lại", "hỗ trợ"],
    "thieu": ["cấp lại", "bổ sung", "xác nhận"],
    "muon co": ["xác nhận", "cấp lại", "bảng điểm"],
    "xin": ["đơn xin", "đề nghị", "yêu cầu"],
    "mong": ["đề nghị", "xin", "yêu cầu"],
    
    # === HOÀN CẢNH ĐẶC BIỆT ===
    "chuyen di": ["chuyển trường", "chuyển ngành", "chuyển điểm"],
    "di lam": ["nghỉ học", "bảo lưu", "học tại chức"],
    "ket hon": ["nghỉ học", "bảo lưu", "chuyển trường"],
    "sinh con": ["nghỉ học", "bảo lưu", "tạm ngưng"],
    "di nuoc ngoai": ["chuyển trường", "bảo lưu", "nghỉ học"],
    "khong du tien": ["học bổng", "gia hạn", "hoãn học phí"],
}

# 🆕 TÍCH HỢP GocL4: Phân tích từ khóa quan trọng
def extract_keywords(text, min_length=2):
    """
    Trích xuất từ khóa quan trọng từ văn bản, loại bỏ từ dừng tiếng Việt
    """
    if not text:
        return []
    
    # Loại bỏ từ dừng tiếng Việt phổ biến
    stop_words = {
        'là', 'của', 'và', 'có', 'được', 'trong', 'với', 'để', 'cho', 'về', 
        'khi', 'đã', 'sẽ', 'này', 'đó', 'các', 'một', 'những', 'từ', 'tại',
        'bởi', 'theo', 'như', 'đến', 'trên', 'dưới', 'giữa', 'sau', 'trước',
        'nếu', 'mà', 'thì', 'hoặc', 'nhưng', 'vì', 'do', 'nên', 'hay'
    }
    
    words = normalize_text(text).split()
    keywords = [word for word in words 
                if len(word) >= min_length and word not in stop_words]
    return keywords

# 🆕 TÍCH HỢP GocL4: Phân tích ý định tìm kiếm
def analyze_search_intent(query):
    """
    Phân tích ý định tìm kiếm để điều chỉnh thuật toán:
    - 'filename': Tìm theo tên file chính xác
    - 'title': Tìm theo tiêu đề biểu mẫu  
    - 'content': Tìm theo nội dung
    - 'semantic': Tìm theo ngữ nghĩa và ý định
    - 'mixed': Tìm tổng hợp
    """
    if not query:
        return 'mixed'
    
    query_clean = normalize_text(query)
    query_lower = query.lower()
    
    # === PHÂN TÍCH CÁC PATTERN ĐẶC TRƯNG ===
    
    # 1. Tìm theo tên file (có đuôi file hoặc tên file cụ thể)
    file_extensions = ['.docx', '.pdf', '.doc', '.txt']
    if any(ext in query_lower for ext in file_extensions):
        return 'filename'
    
    # Tên file pattern (chứa "hutech" + chuỗi liền không dấu)
    if re.search(r'hutech\w{5,}', query_clean):
        return 'filename'
    
    # 2. Tìm theo tiêu đề (có từ khóa "đơn", "biểu mẫu")
    title_indicators = ['don', 'bieu mau', 'form', 'application']
    if any(indicator in query_clean for indicator in title_indicators):
        return 'title'
    
    # 3. Tìm theo ngữ nghĩa (câu dài, có cảm xúc, ý định)
    semantic_indicators = list(CONTEXT_INTENT_MAP.keys())
    if any(indicator in query_clean for indicator in semantic_indicators):
        return 'semantic'
    
    # Câu dài (>6 từ) thường là tìm kiếm ngữ nghĩa
    if len(query_clean.split()) > 6:
        return 'semantic'
    
    # 4. Tìm theo nội dung (từ khóa cụ thể ngắn gọn)
    if len(query_clean.split()) <= 3 and not any(indicator in query_clean for indicator in title_indicators):
        return 'content'
    
    # Mặc định: tìm tổng hợp
    return 'mixed'

# 🆕 TÍCH HỢP GocL4: Xử lý tìm kiếm real-time
def should_return_results(query, min_length=2):
    """
    Quyết định có nên trả kết quả ngay hay không (cho real-time search)
    """
    if not query:
        return False, "empty_query"
    
    query_clean = query.strip()
    
    # Quá ngắn
    if len(query_clean) < min_length:
        return False, "too_short"
    
    # Chỉ có ký tự đặc biệt
    if not re.search(r'[a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', query_clean):
        return False, "no_meaningful_chars"
    
    return True, "valid"

# Tính toán cosine similarity - GIỮ NGUYÊN Cl5Sonnet + CẢI TIẾN
def cosine_similarity(a, b):
    """
    🔧 NÂNG CẤP: Tính toán cosine similarity an toàn và chính xác
    - Xử lý lỗi robust từ Cl5Sonnet
    - Chuẩn hóa vector đầu vào  
    - Kiểm tra edge cases
    """
    try:
        # Chuyển đổi sang numpy array với dtype nhất quán
        a = np.array(a, dtype=np.float32)
        
        if isinstance(b, str):
            # Nếu b là string (từ database), parse nó
            b = np.array(eval(b), dtype=np.float32)
        else:
            b = np.array(b, dtype=np.float32)
        
        # Kiểm tra kích thước vector
        if a.shape != b.shape:
            logging.warning(f"Vector size mismatch: {a.shape} vs {b.shape}")
            return 0.0
        
        # Tính norm
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        # Kiểm tra vector zero
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        # Tính cosine similarity
        similarity = float(np.dot(a, b) / (norm_a * norm_b))
        
        # Đảm bảo kết quả trong khoảng [-1, 1]
        similarity = max(-1.0, min(1.0, similarity))
        
        return similarity
        
    except Exception as e:
        logging.error(f"Lỗi tính cosine similarity: {e}")
        return 0.0

# 🆕 TÍCH HỢP HOÀN CHỈNH: Tiền xử lý truy vấn nâng cao
def preprocess_query(query):
    """
    🚀 TÍCH HỢP HOÀN CHỈNH GocL4 + Cl5Sonnet: Xử lý truy vấn thông minh đa tầng
    
    LOGIC XỬ LÝ TÍCH HỢP:
    1. Phân tích cấu trúc câu truy vấn (viết liền, viết tắt, ngữ cảnh) - GocL4
    2. Áp dụng mapping đồng nghĩa thông minh - GocL4 + Cl5Sonnet
    3. Mở rộng ngữ cảnh dựa trên ý định người dùng - GocL4
    4. Xử lý đặc biệt cho trường hợp phức tạp - GocL4
    5. Tạo nhiều biến thể truy vấn để tăng độ chính xác - Cl5Sonnet
    """
    if not query or not isinstance(query, str):
        return ""
    
    original_query = query.strip()
    clean_query = normalize_text(original_query)
    no_space_query = clean_query.replace(" ", "")
    
    expanded_terms = []
    
    # === BƯỚC 1: KIỂM TRA MAPPING TRỰC TIẾP (GocL4) ===   
    # Kiểm tra query viết liền trước
    if no_space_query in SYNONYM_MAP:
        expanded_terms.extend(SYNONYM_MAP[no_space_query].split())
        logging.info(f"🎯 Tìm thấy mapping viết liền: {no_space_query} -> {SYNONYM_MAP[no_space_query]}")
    
    # Kiểm tra query có khoảng cách
    elif clean_query in SYNONYM_MAP:
        expanded_terms.extend(SYNONYM_MAP[clean_query].split())
        logging.info(f"🎯 Tìm thấy mapping trực tiếp: {clean_query} -> {SYNONYM_MAP[clean_query]}")
    
    # === BƯỚC 2: PHÂN TÍCH TỪNG TỪ (Cl5Sonnet + GocL4) ===
    query_words = clean_query.split()
    for word in query_words:
        if len(word) > 1:  # Bỏ qua từ quá ngắn
            if word in SYNONYM_MAP:
                expansion = SYNONYM_MAP[word]
                expanded_terms.extend(expansion.split())
                logging.info(f"📝 Mở rộng từ: {word} -> {expansion}")
            else:
                expanded_terms.append(word)
        else:
            expanded_terms.append(word)
    
    # === BƯỚC 3: PHÂN TÍCH NGỮ CẢNH VÀ Ý ĐỊNH (GocL4) ===
    intent_keywords = []
    context_found = []
    
    for intent_phrase, related_forms in CONTEXT_INTENT_MAP.items():
        if intent_phrase in clean_query:
            intent_keywords.extend(related_forms)
            context_found.append(intent_phrase)
            logging.info(f"🧠 Phát hiện ngữ cảnh: '{intent_phrase}' -> {related_forms}")
    
    # === BƯỚC 4: XỬ LÝ ĐẶC BIỆT CHO CÁC TRƯỜNG HỢP PHỨC TẠP (GocL4) ===
    
    # Xử lý "di" có thể là "đi" hoặc liên quan đến "điểm"
    if "di" in query_words:
        # Kiểm tra ngữ cảnh xung quanh
        di_index = query_words.index("di")
        context_words = []
        
        # Lấy từ trước và sau "di"
        if di_index > 0:
            context_words.append(query_words[di_index - 1])
        if di_index < len(query_words) - 1:
            context_words.append(query_words[di_index + 1])
        
        # Nếu có từ liên quan đến học tập -> có thể là "điểm"
        academic_words = ["chuyen", "bang", "ket", "qua", "hoc"]
        if any(word in " ".join(context_words) for word in academic_words):
            intent_keywords.extend(["điểm", "bảng điểm", "chuyển điểm"])
            logging.info(f"🎯 Phân tích 'di' trong ngữ cảnh học tập -> thêm 'điểm'")
    
    # === BƯỚC 5: TẠO QUERY CUỐI CÙNG (Cl5Sonnet + GocL4) ===
    
    # Kết hợp tất cả các từ khóa và loại bỏ trùng lặp
    all_terms = expanded_terms + intent_keywords + query_words
    unique_terms = []
    seen = set()
    
    for term in all_terms:
        term_clean = term.strip().lower()
        if term_clean and term_clean not in seen and len(term_clean) > 1:
            unique_terms.append(term_clean)
            seen.add(term_clean)
    
    final_query = " ".join(unique_terms)
    
    # === BƯỚC 6: XỬ LÝ NGỮ CẢNH VÀ CỤM TỪ (Cl5Sonnet) ===
    
    # Kiểm tra cụm từ dài trong SYNONYM_MAP
    context_expansions = []
    for phrase, expansion in SYNONYM_MAP.items():
        # Kiểm tra cụm từ trong truy vấn gốc
        if phrase in clean_query:
            context_expansions.append(expansion)
        # Kiểm tra cụm từ viết liền
        elif phrase in no_space_query:
            context_expansions.append(expansion)
        # Kiểm tra cụm từ trong truy vấn đã mở rộng
        elif phrase in final_query:
            context_expansions.append(expansion)
    
    # Thêm các mở rộng ngữ cảnh
    for expansion in context_expansions:
        if expansion not in final_query:
            final_query += " " + expansion
    
    # === BƯỚC 7: LÀMM SẠCH KẾT QUẢ CUỐI CÙNG ===
    final_query = " ".join(final_query.split())  # Loại bỏ khoảng trắng thừa
    
    # Ghi log kết quả xử lý
    logging.info(f"🔄 TÍCH HỢP - Preprocessing query:")
    logging.info(f"   Original: {original_query}")
    logging.info(f"   Clean: {clean_query}")
    logging.info(f"   No space: {no_space_query}")
    logging.info(f"   Context found: {context_found}")
    logging.info(f"   Final: {final_query}")
    
    return final_query if final_query.strip() else clean_query

# Tạo snippet thông minh - TÍCH HỢP GocL4 + Cl5Sonnet
def create_snippet(content, query_clean, max_length=300):
    """
    🔧 TÍCH HỢP HOÀN CHỈNH: Tạo snippet thông minh từ GocL4 + Cl5Sonnet
    - Sử dụng extract_keywords từ GocL4
    - Tính điểm thông minh từ Cl5Sonnet
    - Tạo ngữ cảnh xung quanh từ khóa
    - Xử lý nhiều loại nội dung khác nhau
    """
    if not content or not query_clean:
        return content[:max_length] + "..." if len(content) > max_length else content
    
    # Tách nội dung thành các câu
    sentences = []
    # Tách theo dấu chấm, chấm hỏi, chấm than, xuống dòng
    raw_sentences = re.split(r'[.!?\n]+', content)
    
    for sentence in raw_sentences:
        sentence = sentence.strip()
        if len(sentence) > 10:  # Bỏ qua câu quá ngắn
            sentences.append(sentence)
    
    if not sentences:
        return content[:max_length] + "..." if len(content) > max_length else content
    
    # 🆕 TÍCH HỢP GocL4: Sử dụng extract_keywords để lấy từ khóa quan trọng
    query_keywords = extract_keywords(query_clean)
    
    if not query_keywords:
        # Nếu không có từ khóa, lấy đoạn đầu
        return content[:max_length] + ("..." if len(content) > max_length else "")
    
    # Tính điểm cho từng câu dựa trên số từ khóa khớp
    sentence_scores = []
    
    for i, sentence in enumerate(sentences):
        sentence_clean = normalize_text(sentence)
        
        # Đếm số từ khóa khớp
        keyword_matches = 0
        phrase_matches = 0
        
        # Kiểm tra từ khóa đơn
        for keyword in query_keywords:
            if keyword in sentence_clean:
                keyword_matches += 1
        
        # Kiểm tra cụm từ (2-3 từ liên tiếp)
        for j in range(len(query_keywords) - 1):
            phrase = " ".join(query_keywords[j:j+2])
            if phrase in sentence_clean:
                phrase_matches += 2  # Cụm từ có điểm cao hơn
        
        # Tính điểm tổng
        total_score = keyword_matches + phrase_matches
        
        # Ưu tiên câu ở đầu (câu tiêu đề thường quan trọng)
        position_bonus = max(0, 3 - i) * 0.1
        
        final_score = total_score + position_bonus
        
        if final_score > 0:
            sentence_scores.append((sentence, final_score, i))
    
    # Sắp xếp theo điểm số
    sentence_scores.sort(key=lambda x: x[1], reverse=True)
    
    if not sentence_scores:
        return content[:max_length] + ("..." if len(content) > max_length else "")
    
    # Tạo snippet từ các câu tốt nhất
    snippet_parts = []
    current_length = 0
    used_positions = set()
    
    # Lấy câu có điểm cao nhất trước
    for sentence, score, position in sentence_scores:
        if current_length + len(sentence) <= max_length:
            snippet_parts.append((sentence, position))
            used_positions.add(position)
            current_length += len(sentence) + 2  # +2 cho khoảng cách
        
        if current_length >= max_length * 0.8:  # Đạt 80% thì dừng
            break
    
    # Sắp xếp lại theo thứ tự xuất hiện trong văn bản gốc
    snippet_parts.sort(key=lambda x: x[1])
    
    # Tạo snippet cuối cùng
    if snippet_parts:
        final_snippet = " ".join([part[0] for part in snippet_parts])
        
        # Thêm dấu "..." nếu cần
        if current_length >= max_length or len(snippet_parts) < len(sentence_scores):
            final_snippet += "..."
        
        return final_snippet
    
    # Fallback: lấy đoạn đầu
    return content[:max_length] + ("..." if len(content) > max_length else "")

# Chuẩn hóa + xử lý viết liền + dịch viết tắt/tiếng Anh - TÍCH HỢP
def normalize_and_expand(text):
    """
    🔧 TÍCH HỢP GocL4 + Cl5Sonnet: Chuẩn hóa và mở rộng văn bản thông minh
    - Xử lý viết liền từ GocL4
    - Áp dụng mapping đồng nghĩa mở rộng
    - Giữ nguyên ý nghĩa gốc nếu không tìm thấy mapping
    """
    if not text:
        return ""
    
    # Chuẩn hóa cơ bản
    text_clean = normalize_text(text)
    text_no_space = text_clean.replace(" ", "")
    
    # Kiểm tra mapping từ SYNONYM_MAP mở rộng
    if text_no_space in SYNONYM_MAP:
        return SYNONYM_MAP[text_no_space]
    elif text_clean in SYNONYM_MAP:
        return SYNONYM_MAP[text_clean]
    
    # Xử lý từng từ
    words = text_clean.split()
    expanded_words = []
    
    for word in words:
        if word in SYNONYM_MAP:
            expanded_words.extend(SYNONYM_MAP[word].split())
        else:
            expanded_words.append(word)
    
    return " ".join(expanded_words) if expanded_words else text_clean

# 🆕 TÍCH HỢP GocL4: Tính độ tương đồng chuỗi (fuzzy matching)
def calculate_string_similarity(str1, str2, method='best'):
    """
    Tính độ tương đồng giữa 2 chuỗi với nhiều phương pháp
    method: 'difflib', 'best' (chọn kết quả tốt nhất)
    """
    if not str1 or not str2:
        return 0.0
    
    str1_clean = normalize_text(str1)
    str2_clean = normalize_text(str2)
    
    if str1_clean == str2_clean:
        return 1.0
    
    similarities = []
    
    # Phương pháp 1: difflib SequenceMatcher
    try:
        difflib_sim = difflib.SequenceMatcher(None, str1_clean, str2_clean).ratio()
        similarities.append(difflib_sim)
    except:
        pass
    
    # Phương pháp 2: Word-level similarity
    words1 = set(str1_clean.split())
    words2 = set(str2_clean.split())
    
    if words1 or words2:
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        word_sim = intersection / union if union > 0 else 0.0
        similarities.append(word_sim)
    
    # Trả về kết quả tùy theo method
    if not similarities:
        return 0.0
    
    if method == 'best':
        return max(similarities)
    elif method == 'average':
        return sum(similarities) / len(similarities)
    else:
        return similarities[0] if similarities else 0.0

#Ham bỏ
# Hàm kiểm tra xem tên file đã tồn tại trong cơ sở dữ liệu chưa
# def is_file_exists(title):  
#     cursor.execute("SELECT COUNT(*) FROM forms WHERE title = %s", (title,))
#     count = cursor.fetchone()[0]
#     return count > 0

# Trích xuất tiêu đề từ nội dung file - GIỮ NGUYÊN Cl5Sonnet
def extract_title_from_content(content):
    """
    🚀 GIỮ NGUYÊN Cl5Sonnet: Trích xuất tiêu đề thông minh từ nội dung
    - Phân tích cấu trúc văn bản
    - Nhận diện tiêu đề dựa trên pattern
    - Xử lý nhiều định dạng khác nhau
    """
    if not content:
        return ""
    
    lines = content.split('\n')
    potential_titles = []
    
    # Duyệt qua 10 dòng đầu tiên
    for i, line in enumerate(lines[:10]):
        line = line.strip()
        
        # Bỏ qua dòng quá ngắn hoặc quá dài
        if len(line) < 5 or len(line) > 150:
            continue
        
        # Tiêu đề thường có các đặc điểm:
        score = 0
        line_lower = normalize_text(line)
        
        # 1. Chứa từ khóa đặc trưng của biểu mẫu
        title_keywords = [
            'đơn', 'biểu mẫu', 'giấy', 'thông báo', 'quyết định', 
            'báo cáo', 'tờ khai', 'phiếu', 'bản kê', 'danh sách',
            'xin', 'đề nghị', 'kiến nghị', 'tham khảo'
        ]
        
        for keyword in title_keywords:
            if keyword in line_lower:
                score += 2
        
        # 2. Vị trí trong văn bản (càng đầu càng tốt)
        if i == 0:
            score += 3
        elif i <= 2:
            score += 2
        elif i <= 5:
            score += 1
        
        # 3. Định dạng (viết hoa, không có dấu chấm câu nhiều)
        if line.isupper() or line.istitle():
            score += 1
        
        if not line.endswith('.'):
            score += 1
        
        # 4. Không chứa quá nhiều số
        digit_count = sum(1 for c in line if c.isdigit())
        if digit_count / len(line) < 0.3:  # Ít hơn 30% là số
            score += 1
        
        potential_titles.append((score, line, i))
    
    # Sắp xếp theo điểm số và chọn tiêu đề tốt nhất
    potential_titles.sort(key=lambda x: x[0], reverse=True)
    
    if potential_titles and potential_titles[0][0] > 2:  # Điểm tối thiểu
        return potential_titles[0][1]
    
    return ""

# 🆕 TÍCH HỢP: Tính độ tương đồng giữa truy vấn và tên file - Cl5Sonnet + GocL4
def calculate_filename_similarity(query_clean, filename_clean):
    """
    🚀 TÍCH HỢP: Tính độ tương đồng thông minh giữa truy vấn và tên file
    - Sử dụng calculate_string_similarity từ GocL4
    - Kết hợp với logic Cl5Sonnet
    - Ưu tiên khớp chính xác và khớp từ khóa
    """
    if not query_clean or not filename_clean:
        return 0.0
    
    # Phương pháp 1: Sử dụng calculate_string_similarity từ GocL4
    string_sim = calculate_string_similarity(query_clean, filename_clean)
    
    # Phương pháp 2: Kiểm tra chứa từ khóa (Cl5Sonnet)
    query_words = set(query_clean.split())
    filename_words = set(filename_clean.split())
    
    if not query_words:
        return string_sim
    
    # Tính tỷ lệ từ khóa chung
    common_words = query_words.intersection(filename_words)
    keyword_ratio = len(common_words) / len(query_words) if query_words else 0
    
    # Phương pháp 3: Kiểm tra khớp substring (Cl5Sonnet)
    substring_bonus = 0
    if query_clean in filename_clean:
        substring_bonus = 0.3
    elif any(word in filename_clean for word in query_words if len(word) > 3):
        substring_bonus = 0.15
    
    # Tính điểm tổng hợp
    final_score = max(string_sim, keyword_ratio) + substring_bonus
    
    # Đảm bảo không vượt quá 1.0
    return min(1.0, final_score)

# Tính độ tương đồng giữa truy vấn và tiêu đề - GIỮ NGUYÊN Cl5Sonnet + CẢI TIẾN
def calculate_title_similarity(query_clean, title_clean):
    """
    🚀 NÂNG CẤP Cl5Sonnet: Tính độ tương đồng thông minh giữa truy vấn và tiêu đề
    - Ưu tiên khớp từ khóa quan trọng
    - Xử lý từ đồng nghĩa và viết tắt
    - Tính toán ngữ cảnh
    - Tích hợp với calculate_string_similarity từ GocL4
    """
    if not query_clean or not title_clean:
        return 0.0
    
    query_words = set(query_clean.split())
    title_words = set(title_clean.split())
    
    if not query_words:
        return 0.0
    
    # Tính tỷ lệ từ khóa chung
    common_words = query_words.intersection(title_words)
    basic_similarity = len(common_words) / len(query_words)
    
    # 🆕 TÍCH HỢP GocL4: Sử dụng calculate_string_similarity
    string_similarity = calculate_string_similarity(query_clean, title_clean)
    
    # Bonus cho khớp substring
    substring_bonus = 0
    if query_clean in title_clean:
        substring_bonus = 0.4
    elif any(word in title_clean for word in query_words if len(word) > 3):
        substring_bonus = 0.2
    
    # Bonus cho từ khóa quan trọng (từ dài)
    important_word_bonus = 0
    for word in query_words:
        if len(word) > 4 and word in title_clean:
            important_word_bonus += 0.1
    
    # Tính điểm cuối cùng - kết hợp nhiều phương pháp
    final_score = max(basic_similarity, string_similarity) + substring_bonus + important_word_bonus
    
    return min(1.0, final_score)

# Tính độ tương đồng giữa truy vấn và nội dung - TÍCH HỢP GocL4 + Cl5Sonnet
def calculate_content_similarity(query_clean, content_clean):
    """
    🚀 TÍCH HỢP: Tính độ tương đồng thông minh giữa truy vấn và nội dung
    - Sử dụng extract_keywords từ GocL4
    - Tính tần suất từ khóa từ Cl5Sonnet
    - Xử lý độ dài nội dung
    - Ưu tiên từ khóa quan trọng
    """
    if not query_clean or not content_clean:
        return 0.0
    
    # 🆕 TÍCH HỢP GocL4: Sử dụng extract_keywords để lấy từ khóa quan trọng
    query_keywords = extract_keywords(query_clean)
    
    if not query_keywords:
        return 0.0
    
    # Đếm từ khóa trong nội dung
    total_matches = 0
    unique_matches = 0
    
    for word in query_keywords:
        if word in content_clean:
            count = content_clean.count(word)
            total_matches += count
            unique_matches += 1
    
    # Tính điểm dựa trên tỷ lệ từ khóa unique
    unique_ratio = unique_matches / len(query_keywords)
    
    # Tính điểm dựa trên tần suất xuất hiện
    frequency_score = min(total_matches / len(query_keywords), 2.0) / 2.0  # Chuẩn hóa về [0,1]
    
    # Kết hợp hai điểm số
    final_score = (unique_ratio * 0.7) + (frequency_score * 0.3)
    
    return min(1.0, final_score)


# ===== API SEARCH TÍCH HỢP HOÀN CHỈNH =====
"""
✅ Phân tích ý định tìm kiếm thông minh từ GocL4
✅ Chuẩn hóa truy vấn tiếng Việt toàn diện từ GocL4
✅ Xử lý viết tắt, không dấu, viết liền với SYNONYM_MAP mở rộng
✅ Hiểu ngữ cảnh cảm xúc với CONTEXT_INTENT_MAP từ GocL4
✅ Tìm kiếm real-time với should_return_results từ GocL4
✅ Snippet thông minh với extract_keywords từ GocL4
✅ Tính điểm đa tầng với trọng số động từ Cl5Sonnet
✅ Xử lý trường hợp đặc biệt (di = điểm/đi) từ GocL4
✅ Logging chi tiết và thống kê hiệu suất từ GocL4
✅ Tất cả tính năng mạnh mẽ của Cl5Sonnet được giữ nguyên
"""
    
@app.get("/search")
def semantic_search(
    query: str = Query(..., description="Câu truy vấn tìm kiếm"),
    top_k: int = Query(10, description="Số lượng kết quả tối đa"),
    min_score: float = Query(0.15, description="Điểm tương đồng tối thiểu")
):
    # 🆕 TÍCH HỢP GocL4: Ghi log bắt đầu tìm kiếm với thông tin chi tiết
    start_time = time.time()
    logging.info(f"🚀 === BẮT ĐẦU TÌM KIẾM TÍCH HỢP HOÀN CHỈNH V4.0 ===")
    logging.info(f"Query gốc: '{query}'")
    logging.info(f"Tham số: top_k={top_k}, min_score={min_score}")
    
    try:
        # ===== BƯỚC 1: KIỂM TRA VÀ CHUẨN BỊ QUERY (TÍCH HỢP GocL4) =====
        original_query = query.strip()
        
        # 🆕 TÍCH HỢP GocL4: Kiểm tra query có hợp lệ không (cho real-time search)
        should_search, reason = should_return_results(original_query)
        if not should_search:
            return {
                "query": original_query,
                "results": [],
                "search_type": reason,
                "message": "Query quá ngắn hoặc không hợp lệ",
                "processing_time": 0.0
            }
        
        # ===== BƯỚC 2: PHÂN TÍCH VÀ TIỀN XỬ LÝ QUERY (TÍCH HỢP HOÀN CHỈNH) =====
        
        # 🆕 TÍCH HỢP GocL4: Phân tích ý định tìm kiếm
        search_intent = analyze_search_intent(original_query)
        logging.info(f"🎯 Ý định tìm kiếm: {search_intent}")
        
        # Chuẩn bị các biến thể của query với preprocessing tích hợp hoàn chỉnh
        query_clean = normalize_text(original_query)
        query_no_space = query_clean.replace(" ", "")
        query_expanded = preprocess_query(original_query)  # 🆕 Sử dụng preprocess_query tích hợp
        query_keywords = extract_keywords(query_expanded)  # 🆕 Sử dụng extract_keywords từ GocL4
        
        logging.info(f"📝 Query sau xử lý tích hợp hoàn chỉnh:")
        logging.info(f"   - Clean: '{query_clean}'")
        logging.info(f"   - No space: '{query_no_space}'")
        logging.info(f"   - Expanded: '{query_expanded}'")
        logging.info(f"   - Keywords: {query_keywords}")
        
        # Phân loại ý định người dùng (GIỮ NGUYÊN logic Cl5Sonnet + bổ sung GocL4)
        is_exact_filename = (
            query_clean.endswith('.docx') or 
            query_clean.endswith('.pdf') or
            len(query_no_space) > 20 or  # Tên file thường rất dài
            any(ext in query_clean for ext in ['.doc', '.txt', '.xlsx'])
        ) or search_intent == 'filename'  # 🆕 TÍCH HỢP: Thêm điều kiện từ analyze_search_intent
        
        # 🆕 TÍCH HỢP GocL4: Xác định xem có phải tìm kiếm theo ngữ cảnh không
        is_contextual_search = any(keyword in query_expanded for keyword in [
            'muốn', 'cần', 'không', 'thích', 'mong muốn', 'hy vọng'
        ]) or search_intent == 'semantic'  # 🆕 TÍCH HỢP: Thêm điều kiện từ analyze_search_intent
        
        logging.info(f"🎯 Search intent analysis tích hợp:")
        logging.info(f"   - Search type: {search_intent}")
        logging.info(f"   - Exact filename: {is_exact_filename}")
        logging.info(f"   - Contextual: {is_contextual_search}")
        
        # ===== BƯỚC 3: TẠO VECTOR TRUY VẤN ĐA CHIẾN LƯỢC (GIỮ NGUYÊN Cl5Sonnet) =====
        query_vectors = {}
        
        try:
            # Vector cho truy vấn gốc
            query_vectors['original'] = model.encode(original_query).tolist()
            
            # Vector cho truy vấn đã chuẩn hóa
            if query_clean != original_query:
                query_vectors['clean'] = model.encode(query_clean).tolist()
            
            # Vector cho truy vấn đã mở rộng (tích hợp preprocess_query từ GocL4)
            if query_expanded != query_clean:
                query_vectors['expanded'] = model.encode(query_expanded).tolist()
                
            logging.info(f"✅ Created {len(query_vectors)} query vectors")
            
        except Exception as e:
            logging.error(f"❌ Lỗi tạo vector: {e}")
            return JSONResponse(
                status_code=500,
                content={"error": "Không thể xử lý truy vấn", "detail": str(e)}
            )
        
        # ===== BƯỚC 4: LẤY DỮ LIỆU TỪ DATABASE =====
        cursor.execute("SELECT id, title, content, embedding FROM forms")
        rows = cursor.fetchall()
        
        if not rows:
            processing_time = time.time() - start_time  # 🆕 TÍCH HỢP GocL4
            logging.info("📭 Không có dữ liệu trong database")
            return {
                "query": original_query,
                "results": [],
                "search_info": {
                    "total_documents": 0,
                    "total_found": 0,
                    "returned": 0,
                    "search_intent": search_intent,  # 🆕 TÍCH HỢP GocL4
                    "processing_time": round(processing_time, 3)
                }
            }
        
        logging.info(f"📊 Processing {len(rows)} documents from database")
        
        # ===== BƯỚC 5: XỬ LÝ TỪNG BIỂU MẪU (TÍCH HỢP HOÀN CHỈNH) =====
        results = []
        
        for doc_id, title, content, embedding in rows:
            try:
                # Chuẩn hóa dữ liệu biểu mẫu
                title_clean = normalize_text(title)
                title_no_space = title_clean.replace(" ", "")
                content_clean = normalize_text(content)
                
                # 🆕 TÍCH HỢP Cl5Sonnet: Trích xuất tiêu đề từ nội dung
                extracted_title = extract_title_from_content(content)
                extracted_title_clean = normalize_text(extracted_title) if extracted_title else ""
                
                # === CHIẾN LƯỢC 1: KHỚP TÊN FILE (TÍCH HỢP GocL4 + Cl5Sonnet) ===
                filename_score = 0.0
                filename_reason = ""
                
                if is_exact_filename or search_intent == 'filename':
                    # 🆕 TÍCH HỢP: Sử dụng calculate_filename_similarity tích hợp
                    filename_score = calculate_filename_similarity(query_clean, title_clean)
                    
                    # Khớp hoàn toàn
                    if query_no_space == title_no_space:
                        filename_score = 1.0
                        filename_reason = "🎯 Khớp chính xác tên file"
                    # Khớp một phần lớn
                    elif query_no_space in title_no_space:
                        filename_score = max(filename_score, 0.95)
                        filename_reason = "🎯 Chứa tên file"
                    elif title_no_space in query_no_space:
                        filename_score = max(filename_score, 0.9)
                        filename_reason = "🎯 Tên file nằm trong truy vấn"
                    elif filename_score > 0.7:
                        filename_reason = "📄 Tên file tương đồng cao"
                else:
                    # Với truy vấn thông thường, chỉ xét nếu có khớp đáng kể
                    if query_clean in title_clean or any(word in title_clean for word in query_clean.split() if len(word) > 3):
                        filename_score = calculate_filename_similarity(query_clean, title_clean)
                        if filename_score > 0.3:
                            filename_reason = "📄 Tên file có từ khóa"
                
                # === CHIẾN LƯỢC 2: KHỚP TIÊU ĐỀ (TÍCH HỢP GocL4 + Cl5Sonnet) ===
                title_score = 0.0
                title_reason = ""
                
                # Kiểm tra với tiêu đề từ tên file
                title_scores = []
                
                # 🆕 TÍCH HỢP: Sử dụng calculate_title_similarity tích hợp
                # So sánh với tiêu đề gốc
                if query_clean in title_clean:
                    title_scores.append((0.9, "📋 Tiêu đề chứa truy vấn chính xác"))
                elif query_expanded in title_clean:
                    title_scores.append((0.85, "📋 Tiêu đề chứa từ mở rộng"))
                else:
                    basic_title_score = calculate_title_similarity(query_clean, title_clean)
                    if basic_title_score > 0.3:
                        title_scores.append((basic_title_score, "📝 Tiêu đề tương đồng"))
                
                # So sánh với tiêu đề trích xuất từ nội dung
                if extracted_title_clean:
                    if query_clean in extracted_title_clean:
                        title_scores.append((0.95, "📊 Tiêu đề nội dung khớp chính xác"))
                    elif query_expanded in extracted_title_clean:
                        title_scores.append((0.9, "📊 Tiêu đề nội dung chứa từ mở rộng"))
                    else:
                        extracted_score = calculate_title_similarity(query_clean, extracted_title_clean)
                        if extracted_score > 0.3:
                            title_scores.append((extracted_score, "📊 Tiêu đề nội dung tương đồng"))
                
                # Lấy điểm tiêu đề cao nhất
                if title_scores:
                    title_score, title_reason = max(title_scores, key=lambda x: x[0])
                
                # === CHIẾN LƯỢC 3: KHỚP NỘI DUNG (TÍCH HỢP GocL4 + Cl5Sonnet) ===
                content_score = 0.0
                content_reason = ""
                
                # 🆕 TÍCH HỢP: Sử dụng calculate_content_similarity tích hợp với extract_keywords
                basic_content_score = calculate_content_similarity(query_clean, content_clean)
                
                # Tính điểm với truy vấn mở rộng
                expanded_content_score = 0.0
                if query_expanded != query_clean:
                    expanded_content_score = calculate_content_similarity(query_expanded, content_clean)
                
                # Lấy điểm cao nhất
                content_score = max(basic_content_score, expanded_content_score)
                
                if content_score > 0.6:
                    content_reason = "📚 Nội dung chứa nhiều từ khóa quan trọng"
                elif content_score > 0.4:
                    content_reason = "📖 Nội dung có từ khóa liên quan"  
                elif content_score > 0.2:
                    content_reason = "📄 Nội dung có ít từ khóa"
                
                # === CHIẾN LƯỢC 4: SEMANTIC SIMILARITY (GIỮ NGUYÊN Cl5Sonnet) ===
                semantic_scores = []
                
                try:
                    for vec_type, query_vec in query_vectors.items():
                        sem_score = cosine_similarity(query_vec, embedding)
                        semantic_scores.append(sem_score)
                        
                    max_semantic_score = max(semantic_scores) if semantic_scores else 0.0
                    avg_semantic_score = sum(semantic_scores) / len(semantic_scores) if semantic_scores else 0.0
                    
                    # Sử dụng điểm trung bình để ổn định hơn
                    final_semantic_score = (max_semantic_score + avg_semantic_score) / 2
                    
                except Exception as e:
                    logging.error(f"Lỗi tính semantic similarity: {e}")
                    final_semantic_score = 0.0
                
                semantic_reason = ""
                if final_semantic_score > 0.8:
                    semantic_reason = "🤖 Tương đồng ngữ nghĩa rất cao"
                elif final_semantic_score > 0.6:
                    semantic_reason = "🤖 Tương đồng ngữ nghĩa cao"
                elif final_semantic_score > 0.4:
                    semantic_reason = "🤖 Tương đồng ngữ nghĩa vừa"
                elif final_semantic_score > 0.2:
                    semantic_reason = "🤖 Tương đồng ngữ nghĩa thấp"
                
                # ===== BƯỚC 6: TÍNH ĐIỂM TỔNG HỢP THÔNG MINH (TÍCH HỢP HOÀN CHỈNH) =====
                
                # 🆕 TÍCH HỢP GocL4: Xác định trọng số dựa trên ý định tìm kiếm từ analyze_search_intent
                if search_intent == 'filename' or is_exact_filename:
                    # Tìm file cụ thể: ưu tiên tên file
                    weights = {
                        'filename': 0.7,
                        'title': 0.15, 
                        'content': 0.1,
                        'semantic': 0.05
                    }
                elif search_intent == 'semantic' or is_contextual_search:
                    # Tìm theo ngữ cảnh: ưu tiên semantic và nội dung
                    weights = {
                        'filename': 0.05,
                        'title': 0.25,
                        'content': 0.35, 
                        'semantic': 0.35
                    }
                elif search_intent == 'title':
                    # Tìm theo tiêu đề: ưu tiên tiêu đề
                    weights = {
                        'filename': 0.1,
                        'title': 0.6,
                        'content': 0.2,
                        'semantic': 0.1
                    }
                elif search_intent == 'content':
                    # Tìm theo nội dung: ưu tiên nội dung
                    weights = {
                        'filename': 0.05,
                        'title': 0.2,
                        'content': 0.5,
                        'semantic': 0.25
                    }
                else:
                    # Tìm kiếm tổng hợp: cân bằng (GIỮ NGUYÊN Cl5Sonnet)
                    weights = {
                        'filename': 0.15,
                        'title': 0.35,
                        'content': 0.3,
                        'semantic': 0.2
                    }
                
                # Tính điểm tổng hợp
                composite_score = (
                    filename_score * weights['filename'] +
                    title_score * weights['title'] +
                    content_score * weights['content'] +
                    final_semantic_score * weights['semantic']
                )
                
                # === BONUS ĐIỂM (TÍCH HỢP GocL4 + Cl5Sonnet) ===
                
                # 🆕 TÍCH HỢP: Bonus cho kết quả có nhiều chiến lược thành công
                successful_strategies = sum([
                    1 for score in [filename_score, title_score, content_score, final_semantic_score] 
                    if score > 0.4
                ])
                
                strategy_bonus = 0
                if successful_strategies >= 3:
                    strategy_bonus = 0.15  # Bonus 15% cho 3+ chiến lược
                elif successful_strategies >= 2:
                    strategy_bonus = 0.1   # Bonus 10% cho 2+ chiến lược
                
                # 🆕 TÍCH HỢP GocL4: Bonus cho từ khóa quan trọng (sử dụng extract_keywords)
                important_keywords = ['đơn', 'xin', 'chuyển', 'nghỉ', 'học', 'bổng']
                keyword_bonus = 0
                for keyword in important_keywords:
                    if keyword in query_keywords and keyword in (title_clean + " " + content_clean):
                        keyword_bonus += 0.02  # 2% cho mỗi từ khóa quan trọng
                
                # Tính điểm cuối cùng
                final_score = composite_score + strategy_bonus + keyword_bonus
                final_score = min(1.0, final_score)  # Đảm bảo không vượt quá 1.0
                
                # ===== BƯỚC 7: LỌC VÀ THÊM KẾT QUẢ =====
                if final_score >= min_score:
                    
                    # Xác định lý do chính (chiến lược tốt nhất)
                    strategy_scores = [
                        (filename_score, filename_reason),
                        (title_score, title_reason), 
                        (content_score, content_reason),
                        (final_semantic_score, semantic_reason)
                    ]
                    
                    # Lấy lý do có điểm cao nhất và có nội dung
                    best_reason = ""
                    for score, reason in sorted(strategy_scores, key=lambda x: x[0], reverse=True):
                        if reason:
                            best_reason = reason
                            break
                    
                    if not best_reason:
                        best_reason = "📄 Có độ tương đồng với truy vấn"
                    
                    # 🆕 TÍCH HỢP: Tạo snippet thông minh với hàm tích hợp từ GocL4 + Cl5Sonnet
                    snippet = create_snippet(content, query_expanded, max_length=400)
                    
                    # Thông tin debug tích hợp
                    debug_info = {
                        "filename_score": round(filename_score, 3),
                        "title_score": round(title_score, 3), 
                        "content_score": round(content_score, 3),
                        "semantic_score": round(final_semantic_score, 3),
                        "composite_score": round(composite_score, 3),
                        "bonuses": round(strategy_bonus + keyword_bonus, 3),
                        "successful_strategies": successful_strategies,
                        "search_intent": search_intent,  # 🆕 TÍCH HỢP GocL4
                        "weights_used": weights,  # 🆕 TÍCH HỢP GocL4
                        "query_keywords": query_keywords  # 🆕 TÍCH HỢP GocL4
                    }
                    
                    results.append({
                        "id": doc_id,
                        "title": title,
                        "snippet": snippet,
                        "similarity_score": round(final_score, 4),
                        "reason": best_reason,
                        "extracted_title": extracted_title if extracted_title else None,
                        "details": debug_info,
                        "search_intent": search_intent  # 🆕 TÍCH HỢP GocL4
                    })
                    
                    logging.info(f"✅ Biểu mẫu '{title[:30]}...' - Điểm: {final_score:.4f} - {best_reason}")
                
            except Exception as e:
                logging.error(f"❌ Lỗi xử lý biểu mẫu '{title}': {e}")
                continue
        
        # ===== BƯỚC 8: SẮP XẾP VÀ TỐI ƯU KẾT QUẢ =====
        if not results:
            processing_time = time.time() - start_time
            logging.info("📭 Không tìm thấy kết quả phù hợp")
            return {
                "query": original_query,
                "results": [],
                "search_info": {
                    "total_documents": len(rows),
                    "total_found": 0,
                    "returned": 0,
                    "search_intent": search_intent,  # 🆕 TÍCH HỢP GocL4
                    "search_strategies": {
                        "exact_filename": is_exact_filename,
                        "contextual": is_contextual_search,
                        "intent_detected": search_intent
                    },
                    "query_processing": {
                        "original": original_query,
                        "clean": query_clean,
                        "expanded": query_expanded,
                        "keywords": query_keywords  # 🆕 TÍCH HỢP GocL4
                    },
                    "processing_time": round(processing_time, 3)
                }
            }
        
        # Sắp xếp kết quả theo điểm số
        sorted_results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)
        
        # ===== BƯỚC 9: TỐI ƯU SỐ LƯỢNG KẾT QUẢ TỰ ĐỘNG (TÍCH HỢP GocL4 + Cl5Sonnet) =====
        actual_top_k = top_k
        
        if len(sorted_results) > 1:
            highest_score = sorted_results[0]["similarity_score"]
            
            # 🆕 TÍCH HỢP GocL4: Case 1: Có kết quả rất tốt (>0.9)
            if highest_score > 0.9:
                # Chỉ giữ lại kết quả có điểm số gần với kết quả tốt nhất
                cutoff_threshold = max(0.6, highest_score * 0.7)
                actual_top_k = 0
                for i, result in enumerate(sorted_results):
                    if result["similarity_score"] >= cutoff_threshold:
                        actual_top_k = i + 1
                    else:
                        break
                actual_top_k = min(actual_top_k, top_k)
                logging.info(f"🎯 Điều chỉnh kết quả do có điểm rất cao: {actual_top_k}")
                
            # Case 2: Kết quả trung bình (0.5-0.9) - GIỮ NGUYÊN Cl5Sonnet
            elif highest_score > 0.5:
                # Giữ nguyên top_k nhưng có thể cắt bớt nếu chênh lệch quá lớn
                cutoff_threshold = max(0.3, highest_score * 0.5)
                actual_top_k = 0
                for i, result in enumerate(sorted_results[:top_k]):
                    if result["similarity_score"] >= cutoff_threshold:
                        actual_top_k = i + 1
                    else:
                        break
                        
            # Case 3: Kết quả kém (<0.5) - TÍCH HỢP GocL4
            else:
                # Mở rộng tìm kiếm nhẹ
                actual_top_k = min(len(sorted_results), top_k + 2)
                logging.info(f"🔄 Mở rộng kết quả do điểm thấp: {actual_top_k}")
        
        # Cắt kết quả cuối cùng
        final_results = sorted_results[:actual_top_k]
        processing_time = time.time() - start_time
        
        # ===== BƯỚC 10: LOG VÀ TRẢ VỀ KẾT QUẢ (TÍCH HỢP GocL4) =====
        logging.info(f"🏁 === KẾT THÚC TÌM KIẾM TÍCH HỢP HOÀN CHỈNH V4.0 ===")
        logging.info(f"   - Documents processed: {len(rows)}")
        logging.info(f"   - Results found: {len(results)}")
        logging.info(f"   - Results returned: {len(final_results)}")
        logging.info(f"   - Search intent: {search_intent}")
        logging.info(f"   - Processing time: {processing_time:.3f}s")
        
        if final_results:
            logging.info(f"   - Best score: {final_results[0]['similarity_score']}")
            logging.info(f"   - Worst score: {final_results[-1]['similarity_score']}")
            logging.info(f"📊 Top 3 results:")
            for i, result in enumerate(final_results[:3]):
                logging.info(f"     {i+1}. {result['title'][:40]}... - {result['similarity_score']:.4f} - {result['reason']}")
        
        return {
            "query": original_query,
            "search_intent": search_intent,  # 🆕 TÍCH HỢP GocL4
            "processed_query": query_expanded if query_expanded != query_clean else query_clean,
            "results": final_results,
            "search_info": {
                "total_documents": len(rows),
                "total_found": len(results),
                "returned": len(final_results),
                "search_strategies": {
                    "exact_filename": is_exact_filename,
                    "contextual": is_contextual_search,
                    "intent_detected": search_intent,  # 🆕 TÍCH HỢP GocL4
                    "weights_used": weights if 'weights' in locals() else None
                },
                "query_processing": {
                    "original": original_query,
                    "clean": query_clean,
                    "expanded": query_expanded if query_expanded != query_clean else None,
                    "keywords": query_keywords,  # 🆕 TÍCH HỢP GocL4
                    "keyword_count": len(query_keywords)
                },
                "performance": {
                    "processing_time": round(processing_time, 3),
                    "min_score_used": min_score,
                    "auto_adjusted_top_k": actual_top_k != top_k,
                    "best_strategy": final_results[0]["reason"] if final_results else None,
                    "vectors_created": len(query_vectors)
                }
            }
        }
        
    except Exception as e:
        error_time = time.time() - start_time
        logging.error(f"❌ LỖI HỆ THỐNG TÌM KIẾM TÍCH HỢP HOÀN CHỈNH V4.0: {e}")
        logging.error(f"Query gây lỗi: '{original_query}'")
        logging.error(f"Thời gian trước lỗi: {error_time:.3f}s")
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "Lỗi hệ thống tìm kiếm tích hợp hoàn chỉnh", 
                "detail": str(e),
                "query": original_query if 'original_query' in locals() else query,
                "processing_time": round(error_time, 3)
            }
        )


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