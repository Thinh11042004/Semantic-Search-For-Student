const axios = require('axios');
require('dotenv').config();

const SEARCH_API = process.env.SEARCH_API || 'http://ai_service:8000/search';


// ✅ Tìm kiếm biểu mẫu thông qua AI Service (semantic search)
const searchForms = async (req, res) => {
  try {
    // ✅ Hỗ trợ cả query hoặc q (dự phòng nếu frontend gửi khác tên)
    const query = req.query.query || req.query.q;
    const top_k = req.query.top_k || 5;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm." });
    }

    // ✅ Gọi đến AI Service để lấy kết quả tìm kiếm ngữ nghĩa
    const response = await axios.get(SEARCH_API, {
      params: { query, top_k },
    });

    const data = response.data;

    // ✅ Nếu AI service trả về không đúng cấu trúc → fallback tránh lỗi
    const topMatches = Array.isArray(data.results || data.top_matches)
      ? (data.results || data.top_matches)
      : [];

    // ✅ Trả kết quả chuẩn hóa về frontend
    return res.status(200).json({
      query,
      totalMatches: topMatches.length,
      results: topMatches.map((item) => ({
        id: item.id, 
        title: item.title,
        file_path: "",
        created_at: new Date(),
      })),
    });
  } catch (err) {
    console.error("❌ Lỗi khi gọi AI service /search:", err.message);
    return res.status(500).json({ message: "Lỗi khi tìm kiếm biểu mẫu." });
  }
};

// ✅ Export để sử dụng trong routes hoặc index
module.exports = { searchForms };

