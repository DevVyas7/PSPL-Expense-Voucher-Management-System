const express = require('express');
const router = express.Router();
const {
  getEmployeeDashboard,
  getDirectorDashboard,
  getAccountsDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/employee', authorize('Employee'), getEmployeeDashboard);
router.get('/director', authorize('Director'), getDirectorDashboard);
router.get('/accounts', authorize('Accounts Team', 'Director'), getAccountsDashboard);

module.exports = router;
