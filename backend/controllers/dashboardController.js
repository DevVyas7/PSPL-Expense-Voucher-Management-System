const Voucher = require('../models/Voucher');

// @desc    Get dashboard metrics for Employee
// @route   GET /api/dashboard/employee
// @access  Private (Employee only)
const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const [
      totalVouchers,
      draftVouchers,
      pendingVouchers,
      approvedVouchers,
      rejectedVouchers,
      claimedAmountResult,
      recentVouchers
    ] = await Promise.all([
      Voucher.countDocuments({ employee: employeeId }),
      Voucher.countDocuments({ employee: employeeId, status: 'Draft' }),
      Voucher.countDocuments({ employee: employeeId, status: 'Pending Approval' }),
      Voucher.countDocuments({ employee: employeeId, status: 'Approved' }),
      Voucher.countDocuments({ employee: employeeId, status: 'Rejected' }),
      Voucher.aggregate([
        { $match: { employee: employeeId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Voucher.find({ employee: employeeId })
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    const totalClaimedAmount = claimedAmountResult.length > 0 ? claimedAmountResult[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalVouchers,
        draftVouchers,
        pendingVouchers,
        approvedVouchers,
        rejectedVouchers,
        totalClaimedAmount,
        recentVouchers
      }
    });
  } catch (error) {
    console.error('getEmployeeDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee dashboard metrics'
    });
  }
};

// @desc    Get dashboard metrics for Director
// @route   GET /api/dashboard/director
// @access  Private (Director only)
const getDirectorDashboard = async (req, res) => {
  try {
    // Current day boundaries in server timezone
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      pendingCount,
      approvedToday,
      rejectedToday,
      pendingAmountResult,
      recentActivity
    ] = await Promise.all([
      Voucher.countDocuments({ status: 'Pending Approval' }),
      Voucher.countDocuments({
        status: 'Approved',
        approvalDate: { $gte: todayStart, $lte: todayEnd }
      }),
      Voucher.countDocuments({
        status: 'Rejected',
        $or: [
          { rejectionDate: { $gte: todayStart, $lte: todayEnd } },
          { rejectionDate: null, updatedAt: { $gte: todayStart, $lte: todayEnd } }
        ]
      }),
      Voucher.aggregate([
        { $match: { status: 'Pending Approval' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Voucher.find()
        .sort({ updatedAt: -1 })
        .limit(8)
    ]);

    const totalPendingAmount = pendingAmountResult.length > 0 ? pendingAmountResult[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        pendingCount,
        approvedToday,
        rejectedToday,
        totalPendingAmount,
        recentActivity
      }
    });
  } catch (error) {
    console.error('getDirectorDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve director dashboard metrics'
    });
  }
};

// @desc    Get dashboard metrics for Accounts Team
// @route   GET /api/dashboard/accounts
// @access  Private (Accounts Team & Director)
const getAccountsDashboard = async (req, res) => {
  try {
    const [
      totalVouchers,
      pendingCount,
      approvedCount,
      rejectedCount,
      approvedAmountResult,
      recentApprovedVouchers
    ] = await Promise.all([
      Voucher.countDocuments(),
      Voucher.countDocuments({ status: 'Pending Approval' }),
      Voucher.countDocuments({ status: 'Approved' }),
      Voucher.countDocuments({ status: 'Rejected' }),
      Voucher.aggregate([
        { $match: { status: 'Approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Voucher.find({ status: 'Approved' })
        .sort({ approvalDate: -1, updatedAt: -1 })
        .limit(6)
    ]);

    const totalApprovedAmount = approvedAmountResult.length > 0 ? approvedAmountResult[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalVouchers,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalApprovedAmount,
        recentApprovedVouchers
      }
    });
  } catch (error) {
    console.error('getAccountsDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve accounts dashboard metrics'
    });
  }
};

module.exports = {
  getEmployeeDashboard,
  getDirectorDashboard,
  getAccountsDashboard
};
