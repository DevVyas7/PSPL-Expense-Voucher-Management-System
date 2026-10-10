import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';

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

const getInitials = (name) => {
  if (!name) return 'V';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getAvatarBg = (str) => {
  const colors = [
    '#EAE8E3', '#E6EBF2', '#F2E8E6', '#E7F0E6', '#EFE6F2', '#F2EFE6'
  ];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const VoucherTable = ({
  vouchers = [],
  showEmployeeColumn = true,
  onDelete,
  onApprove,
  onReject,
  baseDetailPath = '/vouchers'
}) => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'Employee';

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>No Vouchers Found</h3>
        <p>No expense claims match your search criteria or are currently queued.</p>
      </div>
    );
  }

  const totalAmount = vouchers.reduce((acc, v) => acc + (Number(v.amount) || 0), 0);

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Voucher / Claimant</th>
            <th>Expense Date</th>
            {showEmployeeColumn && <th>Department</th>}
            <th>Category</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher) => {
            const initials = getInitials(voucher.employeeName || voucher.expenseTitle);
            const avatarBg = getAvatarBg(voucher.employeeName || voucher.voucherNumber);

            return (
              <tr key={voucher._id}>
                {/* Reference Avatar + Title + Subtitle */}
                <td>
                  <div className="claimant-cell">
                    <div className="claimant-avatar" style={{ backgroundColor: avatarBg }}>
                      {initials}
                    </div>
                    <div className="claimant-info">
                      <Link
                        to={`${baseDetailPath}/${voucher._id}`}
                        style={{ fontWeight: 600, color: '#202020', fontSize: '13px' }}
                      >
                        {voucher.voucherNumber} &bull; {voucher.expenseTitle}
                      </Link>
                      <span className="claimant-sub">
                        {voucher.employeeName} &bull; {formatDate(voucher.createdAt || voucher.expenseDate)}
                      </span>
                    </div>
                  </div>
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(voucher.expenseDate)}</td>

                {showEmployeeColumn && (
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                    {voucher.departmentName}
                  </td>
                )}

                <td style={{ whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      backgroundColor: 'var(--color-bg-subtle)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {voucher.expenseCategory}
                  </span>
                </td>

                <td className="table-amount" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {formatCurrency(voucher.amount)}
                </td>

                <td style={{ textAlign: 'center' }}>
                  <StatusBadge status={voucher.status} />
                </td>

                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {/* View Details Action */}
                    <Link
                      to={`${baseDetailPath}/${voucher._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View Details
                    </Link>

                    {/* Employee Only: Edit and Delete draft vouchers */}
                    {isEmployee && voucher.status === 'Draft' && (
                      <>
                        <Link
                          to={`/employee/edit-voucher/${voucher._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </Link>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(voucher)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete draft"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}

                    {/* Director Inline Actions for Pending */}
                    {onApprove && voucher.status === 'Pending Approval' && (
                      <button
                        type="button"
                        onClick={() => onApprove(voucher)}
                        className="btn btn-success btn-sm"
                      >
                        Approve
                      </button>
                    )}
                    {onReject && voucher.status === 'Pending Approval' && (
                      <button
                        type="button"
                        onClick={() => onReject(voucher)}
                        className="btn btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Reference Summary Footer */}
      <div className="table-footer-bar">
        <span>1–{vouchers.length} of {vouchers.length} vouchers</span>
        <span style={{ fontWeight: 600, color: '#202020' }}>
          Total Value: {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
};

export default VoucherTable;
