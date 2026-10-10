import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voucherAPI } from '../services/api';
import FilterBar from '../components/FilterBar';
import VoucherTable from '../components/VoucherTable';
import ConfirmModal from '../components/ConfirmModal';

const initialFilters = {
  search: '',
  department: '',
  category: '',
  status: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'newest'
};

const MyVouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await voucherAPI.getVouchers(filters);
      if (res.success) {
        setVouchers(res.vouchers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleDeleteDraft = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await voucherAPI.deleteVoucher(deleteTarget._id);
      if (res.success) {
        setDeleteTarget(null);
        await fetchVouchers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete draft voucher');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-section-tag">Claimant Ledger &bull; History</div>
          <h1>My Expense Vouchers</h1>
          <p>View, track, and manage all your submitted claims, drafts, and approval history.</p>
        </div>
        <div className="page-actions">
          <Link to="/employee/create-voucher" className="btn btn-primary">
            + New Voucher
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        showStatusFilter={true}
        showEmployeeSearch={false}
      />

      <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p>Loading your vouchers...</p>
          </div>
        ) : (
          <VoucherTable
            vouchers={vouchers}
            showEmployeeColumn={false}
            onDelete={(voucher) => setDeleteTarget(voucher)}
            baseDetailPath="/employee/vouchers"
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Draft Voucher"
        message={`Are you sure you want to permanently delete draft voucher "${deleteTarget?.voucherNumber}"?`}
        confirmText="Delete Voucher"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteDraft}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default MyVouchersPage;
