const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controllers
const {
    logUploadOrDelete,
    getAdminHistoryLogs,
    deleteFiles,
    logDownload,
    getDownloadHistory
  } = require('../controllers/historyController');

  // === HISTORY ===
router.post('/uploads', logUploadOrDelete);
router.get('/admin-logs', getAdminHistoryLogs);
router.post('/delete', deleteFiles);

router.post('/downloads', logDownload);
router.post('/downloads/user', getDownloadHistory);


module.exports = router;
