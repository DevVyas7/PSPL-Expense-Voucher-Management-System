import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, voucherAPI } from '../services/api';
import StatCard from '../components/StatCard';
import VoucherTable from '../components/VoucherTable';
import ApprovalModal from '../components/ApprovalModal';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val || 0);
};

const DirectorDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending Approval'); // 'Pending Approval' | 'Approved' | 'Rejected' | 'all'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [modalMode, setModalMode] = useState('approve');
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, vouchersRes] = await Promise.all([
        dashboardAPI.getDirectorDashboard(),
        voucherAPI.getVouchers()
      ]);

      if (dashRes.success) {
        setMetrics(dashRes.data);
      }
      if (vouchersRes.success) {
        setVouchers(vouchersRes.vouchers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approval dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenApprove = (voucher) => {
    setActiveVoucher(voucher);
    setModalMode('approve');
  };

  const handleOpenReject = (voucher) => {
    setActiveVoucher(voucher);
    setModalMode('reject');
  };

  const handleConfirmAction = async (payload) => {
    if (!activeVoucher) return;
    try {
      setActionLoading(true);
      if (modalMode === 'approve') {
        await voucherAPI.approveVoucher(activeVoucher._id, payload);
      } else {
        await voucherAPI.rejectVoucher(activeVoucher._id, payload);
      }
      setActiveVoucher(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${modalMode} voucher`);
    } finally {
      setActionLoading(false);
    }
  };

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

  // Filter vouchers according to active tab, search query, department, and category
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

  const pendingCount = vouchers.filter((v) => v.status === 'Pending Approval').length;
  const approvedCount = vouchers.filter((v) => v.status === 'Approved').length;
  const rejectedCount = vouchers.filter((v) => v.status === 'Rejected').length;

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading approval workflow...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header Row */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-section-tag">Executive Oversight &bull; Authorization</div>
          <h1>Voucher Approvals</h1>
          <p>Review submitted company expense claims, inspect attached signatures, and authorize reimbursement.</p>
        </div>
        <div className="page-actions">
          <Link to="/director/all-vouchers" className="btn btn-secondary">
            View Complete Ledger
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Horizontal Tabs Row (Reference Style) */}
      <div className="nav-tabs-bar">
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Pending Approval' ? 'active' : ''}`}
          onClick={() => setActiveTab('Pending Approval')}
        >
          <span>For Approval</span>
          <span className="nav-tab-count" style={{ backgroundColor: pendingCount > 0 ? 'var(--color-accent)' : undefined, color: '#202020' }}>
            {pendingCount}
          </span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('Approved')}
        >
          <span>Approved</span>
          <span className="nav-tab-count">{approvedCount}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('Rejected')}
        >
          <span>Rejected</span>
          <span className="nav-tab-count">{rejectedCount}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>All Vouchers</span>
          <span className="nav-tab-count">{vouchers.length}</span>
        </button>
      </div>

      {/* Compact Metrics Bar */}
      <div className="stat-grid">
        <StatCard
          title="For Approval"
          value={metrics?.pendingCount || 0}
          icon="⏳"
          colorTheme="amber"
          subtitle="Awaiting your signature"
        />
        <StatCard
          title="Approved Today"
          value={metrics?.approvedToday || 0}
          icon="✓"
          colorTheme="green"
          subtitle="Processed today"
        />
        <StatCard
          title="Rejected Today"
          value={metrics?.rejectedToday || 0}
          icon="✕"
          colorTheme="red"
          subtitle="Declined today"
        />
        <StatCard
          title="Pending Total"
          value={formatCurrency(metrics?.totalPendingAmount)}
          icon="₹"
          colorTheme="purple"
          subtitle="Total pending exposure"
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

      {/* Approval Table */}
      <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
        <VoucherTable
          vouchers={filteredVouchers}
          showEmployeeColumn={true}
          onApprove={handleOpenApprove}
          onReject={handleOpenReject}
          baseDetailPath="/director/vouchers"
        />
      </div>

      {/* Modal for Approve (Signature required) & Reject (Reason required) */}
      <ApprovalModal
        isOpen={!!activeVoucher}
        mode={modalMode}
        voucher={activeVoucher}
        isLoading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveVoucher(null)}
      />
    </div>
  );
};

export default DirectorDashboard;
