const mongoose = require('mongoose');
const Voucher = require('../models/Voucher');
const Counter = require('../models/Counter');

// @desc    Get all vouchers with search, filtering, and sorting
// @route   GET /api/vouchers
// @access  Private (Role-based scope)
const getVouchers = async (req, res) => {
  try {
    const {
      search,
      department,
      category,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy
    } = req.query;

    const query = {};

    // Role-based scoping: Employees can ONLY view their own vouchers
    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    }

    // Search by Voucher Number, Employee Name, or Employee ID (sanitized regex)
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      query.$or = [
        { voucherNumber: searchRegex },
        { employeeName: searchRegex },
        { employeeId: searchRegex }
      ];
    }

    // Filter: Employee ID (direct match or prefix)
    if (req.query.employeeId && req.query.employeeId.trim()) {
      query.employeeId = req.query.employeeId.trim();
    }

    // Filter: Employee Name
    if (req.query.employeeName && req.query.employeeName.trim()) {
      const sanitized = req.query.employeeName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.employeeName = new RegExp(sanitized, 'i');
    }

    // Filter: Department
    if (department && department.trim()) {
      query.departmentName = department.trim();
    }

    // Filter: Expense Category
    if (category && category.trim()) {
      query.expenseCategory = category.trim();
    }

    // Filter: Status
    if (status && status.trim()) {
      query.status = status.trim();
    }

    // Filter: Date Range (on expenseDate)
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.expenseDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.expenseDate.$lte = end;
      }
    }

    // Filter: Amount Range
    if (minAmount !== undefined && minAmount !== '' || maxAmount !== undefined && maxAmount !== '') {
      query.amount = {};
      if (minAmount !== undefined && minAmount !== '') {
        const parsedMin = Number(minAmount);
        if (!isNaN(parsedMin)) {
          query.amount.$gte = parsedMin;
        }
      }
      if (maxAmount !== undefined && maxAmount !== '') {
        const parsedMax = Number(maxAmount);
        if (!isNaN(parsedMax)) {
          query.amount.$lte = parsedMax;
        }
      }
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'amount_asc') {
      sortOptions = { amount: 1 };
    } else if (sortBy === 'amount_desc') {
      sortOptions = { amount: -1 };
    } else if (sortBy === 'expense_date_desc') {
      sortOptions = { expenseDate: -1 };
    }

    const vouchers = await Voucher.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: vouchers.length,
      vouchers
    });
  } catch (error) {
    console.error('getVouchers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vouchers'
    });
  }
};

// @desc    Get single voucher by ID
// @route   GET /api/vouchers/:id
// @access  Private
const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Ownership check: Employee can only view their own voucher
    if (
      req.user.role === 'Employee' &&
      voucher.employee.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this voucher'
      });
    }

    return res.status(200).json({
      success: true,
      voucher
    });
  } catch (error) {
    console.error('getVoucherById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch voucher details'
    });
  }
};

// @desc    Create a new voucher (always starts in Draft status)
// @route   POST /api/vouchers
// @access  Private (Employee only)
const createVoucher = async (req, res) => {
  try {
    if (req.user.role !== 'Employee') {
      return res.status(403).json({
        success: false,
        message: 'Only employees can create expense vouchers'
      });
    }

    const {
      voucherDate,
      expenseDate,
      departmentName,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeSignature
    } = req.body;

    // Validate minimum required fields for draft creation
    if (!departmentName || !expenseTitle || !expenseCategory) {
      return res.status(400).json({
        success: false,
        message: 'Department, Expense Title, and Category are required'
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid number greater than zero'
      });
    }

    // Generate atomic, guaranteed unique voucher number
    const currentYear = new Date().getFullYear();
    const voucherNumber = await Counter.getNextVoucherNumber(currentYear);

    const voucher = new Voucher({
      voucherNumber,
      voucherDate: voucherDate ? new Date(voucherDate) : new Date(),
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      departmentName: departmentName.trim(),
      expenseTitle: expenseTitle.trim(),
      expenseCategory,
      expenseDescription: expenseDescription ? expenseDescription.trim() : '',
      amount: parsedAmount,
      employee: req.user._id,
      employeeName: req.user.name,
      employeeId: req.user.employeeId || '',
      employeeSignature: employeeSignature || null,
      status: 'Draft' // Always starts as Draft
    });

    await voucher.save();

    return res.status(201).json({
      success: true,
      message: 'Voucher draft created successfully',
      voucher
    });
  } catch (error) {
    console.error('createVoucher error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create voucher'
    });
  }
};

// @desc    Update a draft voucher
// @route   PUT /api/vouchers/:id
// @access  Private (Employee only)
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Ownership check
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only edit your own vouchers'
      });
    }

    // Business Rule: Can only edit in Draft status
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit voucher with status '${voucher.status}'. Only Draft vouchers can be edited.`
      });
    }

    const {
      expenseDate,
      departmentName,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeSignature
    } = req.body;

    if (expenseDate) voucher.expenseDate = new Date(expenseDate);
    if (departmentName) voucher.departmentName = departmentName.trim();
    if (expenseTitle) voucher.expenseTitle = expenseTitle.trim();
    if (expenseCategory) voucher.expenseCategory = expenseCategory;
    if (expenseDescription !== undefined) voucher.expenseDescription = expenseDescription.trim();
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than zero'
        });
      }
      voucher.amount = parsedAmount;
    }
    if (employeeSignature !== undefined) {
      voucher.employeeSignature = employeeSignature;
    }

    await voucher.save();

    return res.status(200).json({
      success: true,
      message: 'Voucher draft updated successfully',
      voucher
    });
  } catch (error) {
    console.error('updateVoucher error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update voucher'
    });
  }
};

// @desc    Delete a draft voucher
// @route   DELETE /api/vouchers/:id
// @access  Private (Employee only)
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Ownership check
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own vouchers'
      });
    }

    // Business Rule: Can only delete in Draft status
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete voucher with status '${voucher.status}'. Only Draft vouchers can be deleted.`
      });
    }

    await Voucher.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Draft voucher deleted successfully'
    });
  } catch (error) {
    console.error('deleteVoucher error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete voucher'
    });
  }
};

// @desc    Submit a voucher for approval
// @route   POST /api/vouchers/:id/submit
// @access  Private (Employee only)
const submitVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Ownership check
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only submit your own vouchers'
      });
    }

    // Must be in Draft status
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit voucher with status '${voucher.status}'. Only Draft vouchers can be submitted.`
      });
    }

    // Optional updates sent during submission
    const {
      expenseDate,
      departmentName,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeSignature
    } = req.body;

    if (expenseDate) voucher.expenseDate = new Date(expenseDate);
    if (departmentName) voucher.departmentName = departmentName.trim();
    if (expenseTitle) voucher.expenseTitle = expenseTitle.trim();
    if (expenseCategory) voucher.expenseCategory = expenseCategory;
    if (expenseDescription !== undefined) voucher.expenseDescription = expenseDescription.trim();
    if (amount !== undefined) voucher.amount = Number(amount);
    if (employeeSignature) voucher.employeeSignature = employeeSignature;

    // Strict validation before submission
    if (!voucher.departmentName || !voucher.departmentName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required before submission'
      });
    }

    if (!voucher.expenseTitle || !voucher.expenseTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Expense title is required before submission'
      });
    }

    if (!voucher.expenseDate) {
      return res.status(400).json({
        success: false,
        message: 'Expense date is required before submission'
      });
    }

    if (!voucher.amount || voucher.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero before submission'
      });
    }

    if (!voucher.employeeSignature) {
      return res.status(400).json({
        success: false,
        message: 'Employee signature must be uploaded before submission'
      });
    }

    // Change status to Pending Approval
    voucher.status = 'Pending Approval';
    await voucher.save();

    return res.status(200).json({
      success: true,
      message: 'Voucher submitted successfully for Director approval',
      voucher
    });
  } catch (error) {
    console.error('submitVoucher error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit voucher'
    });
  }
};

// @desc    Approve a pending voucher
// @route   POST /api/vouchers/:id/approve
// @access  Private (Director only)
const approveVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { directorSignature } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Business Rule: Can only approve if Pending Approval
    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve voucher. Current status is '${voucher.status}', but must be 'Pending Approval'.`
      });
    }

    // Business Rule: Director signature is required
    if (!directorSignature || !directorSignature.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Director signature is mandatory to approve a voucher'
      });
    }

    // Update approval details (Director cannot modify expense details)
    voucher.status = 'Approved';
    voucher.director = req.user._id;
    voucher.directorName = req.user.name;
    voucher.directorSignature = directorSignature.trim();
    voucher.approvalDate = new Date();
    voucher.rejectionReason = null; // Clear any previous rejection reason
    voucher.rejectionDate = null;

    await voucher.save();

    return res.status(200).json({
      success: true,
      message: 'Voucher approved successfully',
      voucher
    });
  } catch (error) {
    console.error('approveVoucher error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve voucher'
    });
  }
};

// @desc    Reject a pending voucher
// @route   POST /api/vouchers/:id/reject
// @access  Private (Director only)
const rejectVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Business Rule: Can only reject if Pending Approval
    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject voucher. Current status is '${voucher.status}', but must be 'Pending Approval'.`
      });
    }

    // Business Rule: Rejection reason is required
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory when rejecting a voucher'
      });
    }

    // Update rejection details
    voucher.status = 'Rejected';
    voucher.director = req.user._id;
    voucher.directorName = req.user.name;
    voucher.rejectionReason = rejectionReason.trim();
    voucher.rejectionDate = new Date();

    await voucher.save();

    return res.status(200).json({
      success: true,
      message: 'Voucher rejected successfully',
      voucher
    });
  } catch (error) {
    console.error('rejectVoucher error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject voucher'
    });
  }
};

module.exports = {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher
};
