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
    getEmbedding
};