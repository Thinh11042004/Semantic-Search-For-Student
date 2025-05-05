const pool = require('../db');      //Kết nối POSTGRESQL qua pool
const path = require('path');       //Đường dẫn file
const fs = require('fs');           //Phương thức thao tác hệ thống của nodejs
const axios = require('axios');     //Http request
const mammoth = require('mammoth'); //Trích xuất văn bản docx
const pdf = require('pdf-parse');   //Trích xuất văn bản pdf
const xlsx = require('xlsx');       //Trích xuất văn bản excel
const {getEmbedding} = require('./getFormController');

const MAX_TEXT_LENGTH = 5000;   //Giới hạn độ dài văn bản upload
const EMBEDDING_API = process.env.EMBEDDING_API || 'http://localhost:8000/get-embedding';

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
     
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });  // Kiểm tra file đã được upload hay chưa
        } 
  
      const insertedForms = [];

      for (const file of files) {
        const filePath = file.path; // Lấy đường dẫn file đã upload.
        const title = file.originalname;  
  
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

      insertedForms.push(result.rows[0]);
  
      // Xóa file đã upload sau khi lưu vào DB.
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Could not delete uploaded file:', err.message);
      });
           
    }
      // Trả về thông báo thành công.
      res.status(201).json({ message: 'Uploaded', forms: insertedForms });

    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  };


  module.exports = { uploadForm};