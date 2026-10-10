import React, { useState, useEffect } from 'react';
import { dashboardAPI, voucherAPI } from '../services/api';
import StatCard from '../components/StatCard';
import VoucherTable from '../components/VoucherTable';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val || 0);
};

const AccountsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Approved' | 'Pending Approval' | 'Rejected'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, vouchersRes] = await Promise.all([
        dashboardAPI.getAccountsDashboard(),
        voucherAPI.getVouchers()
      ]);

      if (dashRes.success) {
        setMetrics(dashRes.data);
      }
      if (vouchersRes.success) {
        setVouchers(vouchersRes.vouchers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const departmentsList = [
    'Finance',
    'Human Resources',
    'Technology',
    'Marketing',
    'Operations',
    'Investment Banking',
    'Research & Equity',
    'IT & Systems',
    'Compliance & Legal'
  ];

  const categoriesList = [
    'Travel',
    'Food',
    'Accommodation',
    'Office Supplies',
    'Transportation',
    'Other'
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedCategory('');
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab !== 'all' && v.status !== activeTab) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const numMatch = (v.voucherNumber || '').toLowerCase().includes(q);
      const nameMatch = (v.employeeName || '').toLowerCase().includes(q);
      const idMatch = (v.employeeId || '').toLowerCase().includes(q);
      const titleMatch = (v.expenseTitle || '').toLowerCase().includes(q);
      if (!numMatch && !nameMatch && !idMatch && !titleMatch) {
        return false;
      }
    }

    if (selectedDepartment && v.departmentName !== selectedDepartment) {
      return false;
    }

    if (selectedCategory && v.expenseCategory !== selectedCategory) {
      return false;
    }

    return true;
  });

  const approvedCount = vouchers.filter((v) => v.status === 'Approved').length;
  const pendingCount = vouchers.filter((v) => v.status === 'Pending Approval').length;
  const rejectedCount = vouchers.filter((v) => v.status === 'Rejected').length;

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading Accounts financial overview...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header Row */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-section-tag">Accounting & Finance &bull; Read-Only Audit</div>
          <h1>Expense Records</h1>
          <p>Financial ledger oversight, reimbursement disbursement tracking, and authorized company claims.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Horizontal Tabs Row (Reference Style) */}
      <div className="nav-tabs-bar">
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>All Records</span>
          <span className="nav-tab-count">{vouchers.length}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('Approved')}
        >
          <span>Approved (Disbursement Ready)</span>
          <span className="nav-tab-count">{approvedCount}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Pending Approval' ? 'active' : ''}`}
          onClick={() => setActiveTab('Pending Approval')}
        >
          <span>Pending Approval</span>
          <span className="nav-tab-count">{pendingCount}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('Rejected')}
        >
          <span>Rejected</span>
          <span className="nav-tab-count">{rejectedCount}</span>
        </button>
      </div>

      {/* Compact Metrics Bar */}
      <div className="stat-grid">
        <StatCard
          title="Total Vouchers"
          value={metrics?.totalVouchers || 0}
          icon="📋"
          colorTheme="blue"
          subtitle="System-wide claims"
        />
        <StatCard
          title="Pending Approval"
          value={metrics?.pendingCount || 0}
          icon="⏳"
          colorTheme="amber"
          subtitle="Under Director review"
        />
        <StatCard
          title="Approved Claims"
          value={metrics?.approvedCount || 0}
          icon="✓"
          colorTheme="green"
          subtitle="Ready for payout"
        />
        <StatCard
          title="Rejected Claims"
          value={metrics?.rejectedCount || 0}
          icon="✕"
          colorTheme="red"
          subtitle="Declined payouts"
        />
        <StatCard
          title="Approved Sum"
          value={formatCurrency(metrics?.totalApprovedAmount)}
          icon="₹"
          colorTheme="purple"
          subtitle="Authorized payouts"
        />
      </div>

      {/* Quick Search and Filter Toolbar */}
      <div className="table-toolbar" style={{ marginTop: '12px', marginBottom: '14px' }}>
        <div className="toolbar-search-wrapper" style={{ flex: 1 }}>
          <span className="toolbar-search-icon">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search claimant name, employee ID, or voucher ref..."
            className="toolbar-search-input"
          />
        </div>

        <div className="toolbar-controls" style={{ gap: '8px' }}>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="form-select"
            style={{ width: '160px', height: '32px', fontSize: '12px', padding: '4px 8px' }}
          >
            <option value="">All Departments</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ width: '140px', height: '32px', fontSize: '12px', padding: '4px 8px' }}
          >
            <option value="">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(searchTerm || selectedDepartment || selectedCategory) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              title="Reset search and filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Read-Only Table (No Create, Edit, Delete, Approve, or Reject buttons) */}
      <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
        <VoucherTable
          vouchers={filteredVouchers}
          showEmployeeColumn={true}
          baseDetailPath="/accounts/vouchers"
        />
      </div>
    </div>
  );
};

export default AccountsDashboard;
