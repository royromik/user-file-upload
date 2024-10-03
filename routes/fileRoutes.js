const express = require('express');
const { uploadFile, getFiles, downloadFile, deleteFile } = require('../controllers/fileController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.post('/upload', protect, uploadFile);
router.get('/files', protect, getFiles);
router.get('/download/:id/:code', protect, downloadFile);
router.delete('/delete/:id', protect, deleteFile);

module.exports = router;
