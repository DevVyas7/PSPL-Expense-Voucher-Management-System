import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const VoucherTable = ({
  vouchers = [],
  showEmployeeColumn = true,
  onDelete,
  baseDetailPath = '/vouchers'
}) => {
  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>No Vouchers Found</h3>
        <p>No expense vouchers match your search criteria or are currently available.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Voucher #</th>
            <th>Expense Date</th>
            {showEmployeeColumn && <th>Employee</th>}
            <th>Department</th>
            <th>Category</th>
            <th>Expense Title</th>
            <th>Amount</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher) => (
            <tr key={voucher._id}>
              <td>
                <Link
                  to={`${baseDetailPath}/${voucher._id}`}
                  style={{ fontWeight: 600, color: 'var(--color-primary)' }}
                >
                  {voucher.voucherNumber}
                </Link>
              </td>
              <td>{formatDate(voucher.expenseDate)}</td>
              {showEmployeeColumn && (
                <td>
                  <div style={{ fontWeight: 600 }}>{voucher.employeeName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {voucher.employeeId || 'ID: —'}
                  </div>
                </td>
              )}
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
              <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {voucher.expenseTitle}
              </td>
              <td className="table-amount">{formatCurrency(voucher.amount)}</td>
              <td>
                <StatusBadge status={voucher.status} />
              </td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <Link
                    to={`${baseDetailPath}/${voucher._id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View
                  </Link>

                  {/* Actions for Draft vouchers */}
                  {voucher.status === 'Draft' && (
                    <>
                      <Link
                        to={`/employee/edit-voucher/${voucher._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Edit
                      </Link>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(voucher)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherTable;
