const pool = require('../db'); // Kết nối POSTGRESQL qua pool
const path = require('path'); // Thư viện xử lý đường dẫn file
const fs = require('fs'); // Thư viện thao tác file hệ thống NodeJS
const axios = require('axios'); // Thư viện gửi HTTP request

const EMBEDDING_API = process.env.EMBEDDING_API; // Địa chỉ API lấy embedding





// ------------------------------
// Hàm loại bỏ dấu tiếng Việt.
// So sánh nội dung không bị lệch giữa có dấu và không dấu.
// ------------------------------
const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// ------------------------------
// API tìm kiếm biểu mẫu theo semantic search
// ------------------------------
const searchForms = async (req, res) => {
    try {
        const { query } = req.query; // Lấy tham số query từ URL

        // -------------------------
        // Kiểm tra hợp lệ đầu vào.
        // Không có query hoặc query không phải chuỗi sẽ báo lỗi 400.
        // -------------------------
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Thiếu hoặc sai định dạng query' });
        }

        // -------------------------
        // Ghi log query 
        // -------------------------
        console.log('🔎 Người dùng tìm kiếm:', query);

        // -------------------------
        // Gửi trực tiếp tới AI Service để lấy embedding.
        // -------------------------
        const embeddingResponse = await axios.post(EMBEDDING_API, 
            JSON.stringify(query), 
            { headers: { 'Content-Type': 'application/json' } }
          );
          

        // -------------------------
        // Kiểm tra embedding có hợp lệ không.
        // -------------------------
        if (!embeddingResponse.data.embedding || !Array.isArray(embeddingResponse.data.embedding)) {
            throw new Error('Phản hồi embedding không hợp lệ từ AI Service');
        }

        // Chuyển embedding thành chuỗi vector để truyền vào câu lệnh SQL.
        const vector = '[' + embeddingResponse.data.embedding.join(',') + ']';

        // -------------------------
        // Truy vấn cơ sở dữ liệu:
        // - Lấy các biểu mẫu có độ tương đồng  cao nhất.
        // - Sắp xếp giảm dần theo similarity. 
        // -------------------------
        const result = await pool.query(
            `
            SELECT title, file_path, content, created_at,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM forms
            ORDER BY similarity DESC
            LIMIT 10
            `,
            [vector]
        );

        
        // -------------------------
        // Lọc kết quả có chứa từ khóa hoặc similarity cao
        // -------------------------
        
        const keyword = removeDiacritics(query); // Chuẩn hóa từ khóa người dùng (không dấu)

        const filtered = result.rows.filter(row => 
            row.content && removeDiacritics(row.content).includes(keyword)
        );

        const finalResults = filtered.length > 0 ? filtered : result.rows;


        // -------------------------
        // Nếu không có kết quả phù hợp:
        // -------------------------

        if (filtered.length === 0) {
            return res.status(200).json({
                query,
                message: "Không tìm thấy biểu mẫu phù hợp."
            });
        }


        // ------------------------
        // Trả về danh sách kết quả:
        // -------------------------

        return res.status(200).json({
            query,
            totalMatches: result.rows.length,
            results: result.rows.map(row => ({
                title: row.title,
                file_path: row.file_path,
                created_at: row.created_at || new Date()  ,
                similarity: parseFloat(row.similarity).toFixed(4),
            }))
        });

    } catch (err) {
    
        console.error('❌ Lỗi trong searchForms:', err.message);
        return res.status(500).json({
            error: 'Search failed',
            details: err.message
        });
    }
};

module.exports = { searchForms };
