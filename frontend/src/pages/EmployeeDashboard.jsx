import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, voucherAPI } from '../services/api';
import StatCard from '../components/StatCard';
import VoucherTable from '../components/VoucherTable';
import ConfirmModal from '../components/ConfirmModal';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val || 0);
};

const EmployeeDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteVoucherTarget, setDeleteVoucherTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, vouchersRes] = await Promise.all([
        dashboardAPI.getEmployeeDashboard(),
        voucherAPI.getVouchers()
      ]);

      if (dashRes.success) {
        setMetrics(dashRes.data);
      }
      if (vouchersRes.success) {
        setVouchers(vouchersRes.vouchers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load voucher metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteDraft = async () => {
    if (!deleteVoucherTarget) return;
    try {
      setDeleting(true);
      const res = await voucherAPI.deleteVoucher(deleteVoucherTarget._id);
      if (res.success) {
        setDeleteVoucherTarget(null);
        await fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete draft voucher');
    } finally {
      setDeleting(false);
    }
  };

  // Filter vouchers based on the active horizontal reference tab
  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === 'all') return true;
    return v.status === activeTab;
  });

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading your vouchers...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header Row with Reference Lime Primary Action Button */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-section-tag">Bill Pay &bull; Expense Management</div>
          <h1>My Vouchers</h1>
          <p>Track, manage, and submit your personal business reimbursement vouchers.</p>
        </div>
        <div className="page-actions">
          <Link to="/employee/create-voucher" className="btn btn-primary">
            + New Voucher
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Horizontal Tabs Row (Ramp Style: Overview | Drafts | For approval | Approved | Rejected) */}
      <div className="nav-tabs-bar">
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>All Vouchers</span>
          <span className="nav-tab-count">{vouchers.length}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Draft' ? 'active' : ''}`}
          onClick={() => setActiveTab('Draft')}
        >
          <span>Drafts</span>
          <span className="nav-tab-count">{metrics?.draftVouchers || 0}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Pending Approval' ? 'active' : ''}`}
          onClick={() => setActiveTab('Pending Approval')}
        >
          <span>For Approval</span>
          <span className="nav-tab-count">{metrics?.pendingVouchers || 0}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('Approved')}
        >
          <span>Approved</span>
          <span className="nav-tab-count">{metrics?.approvedVouchers || 0}</span>
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === 'Rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('Rejected')}
        >
          <span>Rejected</span>
          <span className="nav-tab-count">{metrics?.rejectedVouchers || 0}</span>
        </button>
      </div>

      {/* Compact Summary Metrics Bar */}
      <div className="stat-grid">
        <StatCard
          title="Draft Claims"
          value={metrics?.draftVouchers || 0}
          icon="📝"
          colorTheme="gray"
          subtitle="Unsubmitted claims"
        />
        <StatCard
          title="Pending Approval"
          value={metrics?.pendingVouchers || 0}
          icon="⏳"
          colorTheme="amber"
          subtitle="Under Director review"
        />
        <StatCard
          title="Approved Claims"
          value={metrics?.approvedVouchers || 0}
          icon="✓"
          colorTheme="green"
          subtitle="Ready for disbursement"
        />
        <StatCard
          title="Rejected Claims"
          value={metrics?.rejectedVouchers || 0}
          icon="✕"
          colorTheme="red"
          subtitle="Declined by audit"
        />
        <StatCard
          title="Total Claimed"
          value={formatCurrency(metrics?.totalClaimedAmount)}
          icon="₹"
          colorTheme="purple"
          subtitle="Cumulative amount"
        />
      </div>

      {/* Vouchers Table Matching Reference Enterprise Design */}
      <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
        <VoucherTable
          vouchers={filteredVouchers}
          showEmployeeColumn={false}
          onDelete={(voucher) => setDeleteVoucherTarget(voucher)}
          baseDetailPath="/employee/vouchers"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteVoucherTarget}
        title="Delete Draft Voucher"
        message={`Are you sure you want to permanently delete draft voucher "${deleteVoucherTarget?.voucherNumber}"? This action cannot be reversed.`}
        confirmText="Delete Voucher"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteDraft}
        onCancel={() => setDeleteVoucherTarget(null)}
      />
    </div>
  );
};

export default EmployeeDashboard;
