import React, { useState, useEffect } from 'react';
import { voucherAPI } from '../services/api';
import FilterBar from '../components/FilterBar';
import VoucherTable from '../components/VoucherTable';
import { useAuth } from '../context/AuthContext';

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

const AllVouchersPage = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const baseDetailPath =
    user?.role === 'Director'
      ? '/director/vouchers'
      : user?.role === 'Accounts Team'
      ? '/accounts/vouchers'
      : '/employee/vouchers';

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-section-tag">Organization Ledger &bull; All Departments</div>
          <h1>Company Expense Vouchers</h1>
          <p>Comprehensive ledger of all company expense claims across departments and approval statuses.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        showStatusFilter={true}
        showEmployeeSearch={true}
      />

      <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p>Loading vouchers ledger...</p>
          </div>
        ) : (
          <VoucherTable
            vouchers={vouchers}
            showEmployeeColumn={true}
            baseDetailPath={baseDetailPath}
          />
        )}
      </div>
    </div>
  );
};

export default AllVouchersPage;
