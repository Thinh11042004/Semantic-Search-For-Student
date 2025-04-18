const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('../controllers/formController');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload', upload.single('form'), controller.uploadForm);
router.post('/get-embedding', controller.getEmbedding);
router.get('/', controller.getForms);
router.get('/forms', controller.getForms);
router.get('/search', controller.searchForms);

module.exports = router;