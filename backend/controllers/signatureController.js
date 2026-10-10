const path = require('path');
const fs = require('fs');
const Voucher = require('../models/Voucher');

/**
 * @desc    Serve signature image with authentication and role-based voucher access control
 * @route   GET /uploads/:filename or GET /api/upload/signature/:filename
 * @access  Private (Requires valid JWT and voucher authorization)
 */
const serveSignature = async (req, res) => {
  try {
    const { filename } = req.params;

    // 1. Path Traversal & Filename Sanitization Checks
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid filename is required'
      });
    }

    const safeFilename = path.basename(filename);

    // Reject filenames with path traversal characters or unexpected symbols
    if (safeFilename !== filename || !/^[a-zA-Z0-9_.-]+$/.test(filename)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename format: Path traversal characters are not permitted'
      });
    }

    const uploadDir = path.resolve(path.join(__dirname, '..', 'uploads'));
    const filePath = path.resolve(path.join(uploadDir, safeFilename));

    // Ensure resolved path is strictly within the uploads directory
    if (!filePath.startsWith(uploadDir)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Path traversal attempt detected'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Requested signature image file not found'
      });
    }

    // 2. Authentication Check (req.user populated by protect middleware)
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Authentication required to view signature files'
      });
    }

    // 3. Authorization Check

    // A. Sample demo fixtures are available to all authenticated corporate users
    if (safeFilename.startsWith('sample-')) {
      return sendImageFile(res, filePath, safeFilename);
    }

    // B. Director and Accounts Team can view signatures on all organizational vouchers
    if (user.role === 'Director' || user.role === 'Accounts Team') {
      return sendImageFile(res, filePath, safeFilename);
    }

    // C. Employee Role Restrictions
    if (user.role === 'Employee') {
      const userPrefix = `sig-${user._id}-`;

      // If the file was freshly uploaded by this employee (unsubmitted draft preview)
      if (safeFilename.startsWith(userPrefix)) {
        return sendImageFile(res, filePath, safeFilename);
      }

      // Check if the signature is linked to any voucher in the database
      const targetUrl = `/uploads/${safeFilename}`;
      const linkedVouchers = await Voucher.find({
        $or: [
          { employeeSignature: targetUrl },
          { directorSignature: targetUrl },
          { employeeSignature: safeFilename },
          { directorSignature: safeFilename }
        ]
      });

      if (linkedVouchers.length > 0) {
        // Verify that this employee owns at least one voucher referencing this signature
        const isOwner = linkedVouchers.some(
          (voucher) => voucher.employee.toString() === user._id.toString()
        );

        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to view signatures from other employees\' vouchers'
          });
        }

        return sendImageFile(res, filePath, safeFilename);
      }

      // If not yet saved on a voucher, check if the file belongs to another user
      if (safeFilename.startsWith('sig-')) {
        const parts = safeFilename.split('-');
        // Format: sig-<userId>-<timestamp>-<random>.ext
        if (parts.length >= 3 && parts[1] !== user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to view this signature'
          });
        }
      }

      // Allow access if it is an unlinked signature not belonging to another employee
      return sendImageFile(res, filePath, safeFilename);
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Your role is not authorized to access signature files'
    });
  } catch (error) {
    console.error('serveSignature error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving signature file'
    });
  }
};

/**
 * Helper to stream image file with appropriate MIME type and caching headers
 */
const sendImageFile = (res, filePath, filename) => {
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'image/png';

  if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.webp') {
    contentType = 'image/webp';
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  return res.sendFile(filePath);
};

module.exports = {
  serveSignature
};
