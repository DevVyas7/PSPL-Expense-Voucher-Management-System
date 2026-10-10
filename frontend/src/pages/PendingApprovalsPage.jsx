import React, { useState, useEffect } from 'react';
import { voucherAPI } from '../services/api';
import FilterBar from '../components/FilterBar';
import VoucherTable from '../components/VoucherTable';
import ApprovalModal from '../components/ApprovalModal';

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
  const [modalMode, setModalMode] = useState('approve');
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingVouchers = async () => {
    try {
      setLoading(true);
      setError('');
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
          <div className="page-section-tag">Executive Queue &bull; Action Required</div>
          <h1>Pending Approval Requests</h1>
          <p>Review submitted expense vouchers, examine attached claimant signatures, and authorize or reject claims.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
        showStatusFilter={false}
        showEmployeeSearch={true}
      />

      <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p>Loading pending claims...</p>
          </div>
        ) : (
          <VoucherTable
            vouchers={vouchers}
            showEmployeeColumn={true}
            onApprove={handleOpenApprove}
            onReject={handleOpenReject}
            baseDetailPath="/director/vouchers"
          />
        )}
      </div>

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
