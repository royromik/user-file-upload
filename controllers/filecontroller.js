const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const File = require('../models/fileModel.js');

// Multer setup for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage }).single('file');

// Upload a file and generate 6-digit code
exports.uploadFile = (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(500).json({ msg: 'File upload failed' });

    const code = shortid.generate().slice(0, 6);  // Generate 6-character code

    const newFile = new File({
      filename: req.file.filename,
      code,
      owner: req.user._id,
      path: req.file.path,
    });

    await newFile.save();
    res.json({ msg: 'File uploaded', code });
  });
};

// Get list of uploaded files for the logged-in user
exports.getFiles = async (req, res) => {
  const files = await File.find({ owner: req.user._id });
  res.json(files);
};

// Download a file with the correct code
exports.downloadFile = async (req, res) => {
  const { id, code } = req.params;
  const file = await File.findById(id);
  if (!file) return res.status(404).json({ msg: 'File not found' });

  if (file.code !== code) return res.status(400).json({ msg: 'Invalid code' });

  res.download(file.path);
};

// Delete a file
exports.deleteFile = async (req, res) => {
  const { id } = req.params;
  const file = await File.findById(id);
  if (!file || file.owner.toString() !== req.user._id.toString()) {
    return res.status(401).json({ msg: 'Not authorized' });
  }

  fs.unlinkSync(file.path);  // Delete file from file system
  await file.remove();       // Remove from database
  res.json({ msg: 'File deleted' });
};
