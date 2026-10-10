import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voucherAPI } from '../services/api';
import FilterBar from '../components/FilterBar';
import ApprovalModal from '../components/ApprovalModal';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const initialFilters = {
  search: '',
  department: '',
  category: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'newest'
};

const PendingApprovalsPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [modalMode, setModalMode] = useState('approve'); // 'approve' | 'reject'
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingVouchers = async () => {
    try {
      setLoading(true);
      setError('');
      // Force status = 'Pending Approval'
      const res = await voucherAPI.getVouchers({
        ...filters,
        status: 'Pending Approval'
      });
      if (res.success) {
        setVouchers(res.vouchers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVouchers();
  }, [filters]);

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
      await fetchPendingVouchers();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${modalMode} voucher`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Pending Approval Requests</h1>
          <p>Carefully evaluate submitted expense claims, review attached signatures, and approve or reject.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
        showStatusFilter={false} // fixed to Pending Approval
        showEmployeeSearch={true}
      />

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Pending Claims Queue ({vouchers.length})</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="spinner-container">
              <div className="spinner" />
              <p>Loading pending claims...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <h3>No Pending Approvals</h3>
              <p>Great news! All submitted vouchers have been reviewed and processed.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Voucher #</th>
                    <th>Expense Date</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Category</th>
                    <th>Expense Title</th>
                    <th>Amount</th>
                    <th>Employee Signature</th>
                    <th style={{ textAlign: 'right' }}>Executive Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((voucher) => (
                    <tr key={voucher._id}>
                      <td>
                        <Link
                          to={`/director/vouchers/${voucher._id}`}
                          style={{ fontWeight: 600, color: 'var(--color-primary)' }}
                        >
                          {voucher.voucherNumber}
                        </Link>
                      </td>
                      <td>{formatDate(voucher.expenseDate)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{voucher.employeeName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {voucher.employeeId || 'ID: —'}
                        </div>
                      </td>
                      <td>{voucher.departmentName}</td>
                      <td>
                        <span
                          style={{
                            backgroundColor: 'var(--color-bg-subtle)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {voucher.expenseCategory}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {voucher.expenseTitle}
                      </td>
                      <td className="table-amount">{formatCurrency(voucher.amount)}</td>
                      <td>
                        {voucher.employeeSignature ? (
                          <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
                            ✓ Verified Attached
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', fontSize: '12px' }}>Missing</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Link
                            to={`/director/vouchers/${voucher._id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenApprove(voucher)}
                            className="btn btn-success btn-sm"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenReject(voucher)}
                            className="btn btn-danger btn-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approval / Rejection Modal */}
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

export default PendingApprovalsPage;
