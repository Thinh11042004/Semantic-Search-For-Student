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


// Multer config
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

// === FORM ===
router.post('/upload', upload.array('form'), uploadForm);
router.get('/page', getFormsByPage);
router.get('/search', searchForms);
router.get('/:id', getFormById);

module.exports = router;
