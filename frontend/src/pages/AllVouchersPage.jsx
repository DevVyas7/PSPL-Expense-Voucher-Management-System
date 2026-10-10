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
          <h1>Company Expense Vouchers</h1>
          <p>
            Comprehensive ledger of all organization-wide expense claims across departments and statuses.
          </p>
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

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Vouchers Ledger ({vouchers.length})</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
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
    </div>
  );
};

export default AllVouchersPage;
