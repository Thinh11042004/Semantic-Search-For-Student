const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controllers
const {
    logUploadOrDelete,
    getAdminHistoryLogs,
    deleteFiles
  } = require('../controllers/historyController');

  // === HISTORY ===
router.post('/uploads', logUploadOrDelete);
router.get('/admin-logs', getAdminHistoryLogs);
router.post('/delete', deleteFiles);




module.exports = router;
