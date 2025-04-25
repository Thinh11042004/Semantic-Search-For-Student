const pool = require('../db');      //Kết nối POSTGRESQL qua pool
const path = require('path');       //Đường dẫn file
const fs = require('fs');           //Phương thức thao tác hệ thống của nodejs
const axios = require('axios');     //Http request
const mammoth = require('mammoth'); //Trích xuất văn bản docx
const pdf = require('pdf-parse');   //Trích xuất văn bản pdf
const xlsx = require('xlsx');       //Trích xuất văn bản excel

const MAX_TEXT_LENGTH = 5000;   //Giới hạn độ dài văn bản upload
const EMBEDDING_API = 'http://localhost:8000/get-embedding'; //Địa chỉ FastAPI

// Hàm trích xuất nội dung từ file
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();     //Lấy phần mở rộng của file
  const buffer = await fs.promises.readFile(filePath); //Đọc file bằng Buffer

  try {
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer }); // Trích xuất văn bản từ file DOCX.
      return result.value;
    } else if (ext === '.pdf') {
      const result = await pdf(buffer); // Trích xuất văn bản từ file PDF.
      return result.text;
    } else if (ext === '.xlsx') {
      const workbook = xlsx.read(buffer, { type: 'buffer' }); // Đọc file EXCEL
      const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Lấy Sheet đầu tiên
      return xlsx.utils.sheet_to_csv(sheet); //Trả về CSV
    } else {
      throw new Error('Unsupported file type'); //Lỗi upload file ko phù hợp
    }
  } catch (err) {
    throw new Error(`Error extracting file content: ${err.message}`); // Bắt lỗi khi không trích xuất được file
  }
};


// Upload form
const uploadForm = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' }); // Kiểm tra file đã được upload hay chưa

    const filePath = req.file.path; // Lấy đường dẫn file đã upload.
    const title = req.file.originalname; // Lấy tên file.

    const content = await extractTextFromFile(filePath); // Trích xuất nội dung từ file.
    const truncated = content.slice(0, MAX_TEXT_LENGTH); // Cắt nội dung để đảm bảo không quá 5000 ký tự.

    let embed;
    try {
      embed = await axios.post(EMBEDDING_API, { text: truncated }); // Gửi văn bản đến API FastAPI để lấy embedding.
    } catch (e) {
      return res.status(500).json({ error: 'Failed to connect to embedding API', details: e.message }); //Thông báo lỗi kết nối không thành công.
    }

    if (!embed.data || !Array.isArray(embed.data.embedding)) { // Kiểm tra phản hồi từ API embedding.
      return res.status(500).json({ error: 'Invalid embedding response' }); //Thông báo lỗi không có embedding hợp lệ.
    }

    const vector = JSON.stringify(embed.data.embedding); // Chuyển embedding thành chuỗi JSON.

    // Lưu vào cơ sở dữ liệu PostgreSQL.
    const result = await pool.query(
      'INSERT INTO forms (title, file_path, content, embedding) VALUES ($1, $2, $3, $4::vector) RETURNING *',
      [title, filePath, truncated, vector]
    );

    // Xóa file đã upload sau khi lưu vào DB.
    fs.unlink(filePath, (err) => {
      if (err) console.warn('Could not delete uploaded file:', err.message);
    });

    // Trả về thông báo thành công.
    res.status(201).json({ message: 'Uploaded', form: result.rows[0] });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};
// Get all forms
const getForms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM forms ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
};

// Get embedding
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


module.exports = {
  uploadForm,
  getForms,
  getEmbedding,
  searchForms
};
