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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteVoucherTarget, setDeleteVoucherTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getEmployeeDashboard();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
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

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading your employee dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Employee Dashboard</h1>
          <p>Track your expense claims, drafts, and approval status in real-time.</p>
        </div>
        <div className="page-actions">
          <Link to="/employee/create-voucher" className="btn btn-primary">
            <span>➕</span> Create New Voucher
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPI Statistic Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Vouchers"
          value={metrics?.totalVouchers || 0}
          icon="📋"
          colorTheme="blue"
        />
        <StatCard
          title="Draft Vouchers"
          value={metrics?.draftVouchers || 0}
          icon="📝"
          colorTheme="gray"
        />
        <StatCard
          title="Pending Approval"
          value={metrics?.pendingVouchers || 0}
          icon="⏳"
          colorTheme="amber"
        />
        <StatCard
          title="Approved Vouchers"
          value={metrics?.approvedVouchers || 0}
          icon="✅"
          colorTheme="green"
        />
        <StatCard
          title="Rejected Vouchers"
          value={metrics?.rejectedVouchers || 0}
          icon="❌"
          colorTheme="red"
        />
        <StatCard
          title="Total Claimed Amount"
          value={formatCurrency(metrics?.totalClaimedAmount)}
          icon="₹"
          colorTheme="purple"
        />
      </div>

      {/* Recent Activity Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Voucher Claims</h2>
          <Link to="/employee/my-vouchers" className="btn btn-secondary btn-sm">
            View All Vouchers →
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <VoucherTable
            vouchers={metrics?.recentVouchers || []}
            showEmployeeColumn={false}
            onDelete={(voucher) => setDeleteVoucherTarget(voucher)}
            baseDetailPath="/employee/vouchers"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteVoucherTarget}
        title="Delete Draft Voucher"
        message={`Are you sure you want to permanently delete draft voucher "${deleteVoucherTarget?.voucherNumber}"? This action cannot be undone.`}
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
