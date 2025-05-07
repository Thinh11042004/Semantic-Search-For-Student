const pool = require('../db');      //Kết nối POSTGRESQL qua pool
const path = require('path');       //Đường dẫn file
const fs = require('fs');           //Phương thức thao tác hệ thống của nodejs
const axios = require('axios');     //Http request
const { searchForms } = require('./searchFormController');

// Get all forms
const getForms = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM forms ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch forms' });
    }
  };


  // Lấy forms theo phân trang
const getFormsByPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM forms');
    const totalForms = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalForms / limit);

    const result = await pool.query(
      'SELECT * FROM forms ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      forms: result.rows,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching paginated forms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  const getEmbedding = async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Missing text' }); // Kiểm tra xem có text không.
  
      const result = await axios.post(EMBEDDING_API, { text }); // Gửi văn bản đến FastAPI để lấy embedding.
      if (!result.data || !Array.isArray(result.data.embedding)) { // Kiểm tra phản hồi từ API embedding.
        return res.status(500).json({ error: 'Invalid embedding response' });//Thông báo lỗi không có embedding hợp lệ.
      }
  
      res.json({ embedding: result.data.embedding }); // Trả về embedding.
    } catch (err) {
      res.status(500).json({ error: 'Failed to get embedding', details: err.message }); //Thông báo lỗi không thể lấy embedding.
    }
  };


  module.exports = { 
    getForms,
    getFormsByPage,
    getEmbedding
};