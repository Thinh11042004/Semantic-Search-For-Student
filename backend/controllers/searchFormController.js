const axios = require('axios'); // Thư viện gửi HTTP request

const EMBEDDING_API = process.env.SEARCH_API; 
// ------------------------------
// API tìm kiếm biểu mẫu theo semantic search
// ------------------------------
const searchForms = async (req, res) => {
    try {
        const { query } = req.query;

        // -------------------------
        // Kiểm tra hợp lệ đầu vào.
        // -------------------------
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Thiếu hoặc sai định dạng query' });
        }

        // -------------------------
        // Gửi request sang AI service /search
        // -------------------------
        console.log('🔎 Gửi truy vấn đến AI /search:', query);
        const aiResponse = await axios.post(`${EMBEDDING_API}/search`, {
            query: query.trim(),
            top_k: 10
        });

        const data = aiResponse.data;

        // -------------------------
        // Kiểm tra kết quả trả về hợp lệ không
        // -------------------------
        if (!data || !Array.isArray(data.results)) {
            return res.status(500).json({ error: 'Kết quả trả về không hợp lệ từ AI service' });
        }

        // -------------------------
        // Trả kết quả về frontend
        // -------------------------
        return res.status(200).json({
            query,
            totalMatches: data.results.length,
            results: data.results.map(item => ({
                title: item.title,
                file_path: item.file_path,
                created_at: item.created_at || new Date(),
                similarity: parseFloat(item.similarity).toFixed(4)
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
