const express = require('express');
const router = express.Router();
const {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher
} = require('../controllers/voucherController');
const { protect, authorize } = require('../middleware/auth');

// All voucher routes require authentication
router.use(protect);

// List all vouchers (scoped by role inside controller) & Create voucher (Employee only)
router
  .route('/')
  .get(getVouchers)
  .post(authorize('Employee'), createVoucher);

// Single voucher details, update draft, delete draft
router
  .route('/:id')
  .get(getVoucherById)
  .put(authorize('Employee'), updateVoucher)
  .delete(authorize('Employee'), deleteVoucher);

// Actions
router.post('/:id/submit', authorize('Employee'), submitVoucher);
router.post('/:id/approve', authorize('Director'), approveVoucher);
router.post('/:id/reject', authorize('Director'), rejectVoucher);

module.exports = router;
