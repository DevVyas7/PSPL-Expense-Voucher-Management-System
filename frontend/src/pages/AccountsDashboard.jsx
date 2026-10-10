import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getAccountsDashboard();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading Accounts financial metrics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Accounts Dashboard</h1>
          <p>Financial reimbursement oversight, authorized approvals monitoring, and ledger accounting.</p>
        </div>
        <div className="page-actions">
          <Link to="/accounts/all-vouchers" className="btn btn-primary">
            <span>📑</span> Access All Vouchers
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPI Metric Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Vouchers"
          value={metrics?.totalVouchers || 0}
          icon="📋"
          colorTheme="blue"
        />
        <StatCard
          title="Pending Approval"
          value={metrics?.pendingCount || 0}
          icon="⏳"
          colorTheme="amber"
          subtitle="Awaiting Director"
        />
        <StatCard
          title="Approved Vouchers"
          value={metrics?.approvedCount || 0}
          icon="✅"
          colorTheme="green"
          subtitle="Ready for Reimbursement"
        />
        <StatCard
          title="Rejected Vouchers"
          value={metrics?.rejectedCount || 0}
          icon="❌"
          colorTheme="red"
          subtitle="Not Disbursed"
        />
        <StatCard
          title="Total Approved Expenses"
          value={formatCurrency(metrics?.totalApprovedAmount)}
          icon="₹"
          colorTheme="purple"
          subtitle="Authorized Payouts"
        />
      </div>

      {/* Recent Approved Vouchers ready for payout */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Approved Vouchers (Reimbursement Pipeline)</h2>
          <Link to="/accounts/all-vouchers" className="btn btn-secondary btn-sm">
            View Complete Ledger →
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <VoucherTable
            vouchers={metrics?.recentApprovedVouchers || []}
            showEmployeeColumn={true}
            baseDetailPath="/accounts/vouchers"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;
