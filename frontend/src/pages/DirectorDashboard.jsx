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

const DirectorDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getDirectorDashboard();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load director dashboard');
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
        <p>Loading director metrics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Director Dashboard</h1>
          <p>Review executive oversight, approve pending claims, and track daily voucher outcomes.</p>
        </div>
        <div className="page-actions">
          <Link to="/director/pending-approvals" className="btn btn-primary">
            <span>⏳</span> Review Pending ({metrics?.pendingCount || 0})
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard
          title="Pending Approval"
          value={metrics?.pendingCount || 0}
          icon="⏳"
          colorTheme="amber"
          subtitle="Awaiting Director Review"
        />
        <StatCard
          title="Approved Today"
          value={metrics?.approvedToday || 0}
          icon="✅"
          colorTheme="green"
          subtitle="Processed Today"
        />
        <StatCard
          title="Rejected Today"
          value={metrics?.rejectedToday || 0}
          icon="❌"
          colorTheme="red"
          subtitle="Declined Today"
        />
        <StatCard
          title="Total Pending Amount"
          value={formatCurrency(metrics?.totalPendingAmount)}
          icon="₹"
          colorTheme="purple"
          subtitle="Total Exposure"
        />
      </div>

      {/* Recent Voucher Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Voucher Activity</h2>
          <Link to="/director/all-vouchers" className="btn btn-secondary btn-sm">
            View All Vouchers →
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <VoucherTable
            vouchers={metrics?.recentActivity || []}
            showEmployeeColumn={true}
            baseDetailPath="/director/vouchers"
          />
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
