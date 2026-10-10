const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.use(protect);

// Upload signature route
router.post('/signature', (req, res) => {
  upload.single('signature')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 2MB limit. Please upload a smaller image.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was provided'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Signature image uploaded successfully',
      fileUrl,
      filename: req.file.filename
    });
  });
});

module.exports = router;
