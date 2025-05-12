const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controllers
const {
  getFormById,
  getEmbedding,
  getFormsByPage
} = require('../controllers/getFormController');
const { uploadForm } = require('../controllers/uploadController');
const { searchForms } = require('../controllers/searchFormController');
const {
  logUploadOrDelete,
  getUploadLogs,
  deleteFiles,
  logDownload,
  getDownloadHistory
} = require('../controllers/historyController');

// Cấu hình lưu file với Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ========== ROUTES ==========

// --- FORM FUNCTIONALITY --- //
router.post('/upload', upload.array('form'), uploadForm);
router.get('/forms/page', getFormsByPage);
router.get('/search', searchForms);
router.get('/form/:id', getFormById);

// --- HISTORY / LOG --- //
router.post('/history/uploads', logUploadOrDelete);             // Ghi log upload/delete
router.get('/history/uploads', getUploadLogs);                  // Lấy toàn bộ lịch sử upload/delete (admin)
router.post('/history/uploads/delete', deleteFiles);            // Xóa nhiều file + log

router.post('/history/downloads', logDownload);                 // ✅ Ghi log khi tải file (user)
router.post('/history/downloads/user', getDownloadHistory);     // ✅ Lấy lịch sử tải file theo user


module.exports = router;
