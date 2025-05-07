const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { getForms,getEmbedding, getFormsByPage } = require('../controllers/getFormController');
const { uploadForm } = require('../controllers/uploadController');
const { searchForms } = require('../controllers/searchFormController');

const router = express.Router();

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Only PDF, DOCX, XLSX files are allowed'));
    }
    cb(null, true);
  }
});

// Routes
router.post('/upload', upload.array('form'), uploadForm);
router.get('/forms/page', getFormsByPage);
router.post('/get-embedding', getEmbedding);
router.get('/search', searchForms);

module.exports = router;
