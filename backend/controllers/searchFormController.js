const axios = require('axios'); // Thư viện gửi HTTP request

// Lấy URL API tìm kiếm từ biến môi trường
const SEARCH_API = process.env.SEARCH_API; 

// ------------------------------
// API tìm kiếm biểu mẫu theo semantic search
// ------------------------------
const searchForms = async (req, res) => {
    try {
        const { query } = req.query;

        // Kiểm tra hợp lệ đầu vào
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Thiếu hoặc sai định dạng query' });
        }

        // Gửi request đến API /search từ app.py
        console.log('🔎 Gửi truy vấn đến backend /search:', query);

        // Gọi API tìm kiếm của app.py
        const aiResponse = await axios.get(`${SEARCH_API}?query=${encodeURIComponent(query.trim())}`);

        const data = aiResponse.data;

        // Kiểm tra kết quả trả về từ API
        if (!data || !Array.isArray(data.results)) {
            return res.status(500).json({ error: 'Kết quả trả về không hợp lệ từ API tìm kiếm' });
        }

        // Trả kết quả tìm kiếm về frontend
        return res.status(200).json({
            query,
            totalMatches: data.results.length,
            results: data.results.map(item => ({
                title: item.title,
                file_path: item.file_path,
                created_at: item.created_at || new Date(),
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
