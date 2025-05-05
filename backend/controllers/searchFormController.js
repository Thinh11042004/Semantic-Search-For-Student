const pool = require('../db');      //Kết nối POSTGRESQL qua pool
const path = require('path');       //Đường dẫn file
const fs = require('fs');           //Phương thức thao tác hệ thống của nodejs
const axios = require('axios');     //Http request

const EMBEDDING_API = process.env.EMBEDDING_API || 'http://localhost:8000/get-embedding'; //Địa chỉ FastAPI


// Semantic search
const searchForms = async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ error: 'Missing query' }); // Kiểm tra xem có query không.
  
      const embeddingResponse = await axios.post(EMBEDDING_API, { text: query }); // Lấy embedding của câu truy vấn.
      const vector = '[' + embeddingResponse.data.embedding.join(',') + ']'; // Chuyển embedding thành chuỗi JSON.
  
      const SIMILARITY_THRESHOLD = 0.72; // Đặt ngưỡng độ tương đồng.
  
      // Truy vấn cơ sở dữ liệu tìm các biểu mẫu có độ tương đồng cao nhất.
      const result = await pool.query(
        `
        SELECT title, file_path , content , 1 - (embedding <=> $1::vector) AS similarity
        FROM forms
        ORDER BY similarity DESC
        LIMIT 10
        `,
        [vector]
      );
  
      // Lọc kết quả tìm kiếm bằng từ khóa.
      const keyword = query.toLowerCase();
      const filtered = result.rows.filter(row =>
        row.content && row.content.toLowerCase().includes(query.toLowerCase())
      );
  
      if (filtered.length === 0) {
        return res.status(200).json({
          query,
          message: "Không tìm thấy biểu mẫu phù hợp."
        });
      }
  
      return res.status(200).json({
        query,
        totalMatches: filtered.length,
        results: filtered.map(row => ({
          title: row.title,
          file_path: row.file_path,
          similarity: parseFloat(row.similarity).toFixed(4)
        }))
      });
  
    } catch (err) {
      console.error('❌ Error in searchForms:', err);
      return res.status(500).json({
        error: 'Search failed',
        details: err.message
      });
    }
  };

  module.exports = { searchForms};