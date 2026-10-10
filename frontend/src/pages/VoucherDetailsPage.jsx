import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { voucherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import ApprovalModal from '../components/ApprovalModal';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val || 0);
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return d.toLocaleDateString('en-IN', options);
};

const VoucherDetailsPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const getAuthSigUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/') && token) {
      return `${url}?token=${encodeURIComponent(token)}`;
    }
    return url;
  };

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approvalModalMode, setApprovalModalMode] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await voucherAPI.getVoucherById(id);
      if (res.success && res.voucher) {
        setVoucher(res.voucher);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load voucher details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  // Employee: Delete Draft
  const handleDeleteDraft = async () => {
    try {
      setActionLoading(true);
      const res = await voucherAPI.deleteVoucher(id);
      if (res.success) {
        navigate('/employee/my-vouchers');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete draft voucher');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Employee: Submit Draft
  const handleSubmitVoucher = async () => {
    if (!voucher?.employeeSignature) {
      alert('An employee signature must be attached before submitting. Please click Edit Draft to upload or draw your signature.');
      setShowSubmitModal(false);
      return;
    }

    try {
      setActionLoading(true);
      const res = await voucherAPI.submitVoucher(id);
      if (res.success) {
        setShowSubmitModal(false);
        await fetchVoucher();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit voucher');
    } finally {
      setActionLoading(false);
    }
  };

  // Director: Approve / Reject
  const handleDirectorAction = async (payload) => {
    try {
      setActionLoading(true);
      if (approvalModalMode === 'approve') {
        await voucherAPI.approveVoucher(id, payload);
      } else {
        await voucherAPI.rejectVoucher(id, payload);
      }
      setApprovalModalMode(null);
      await fetchVoucher();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${approvalModalMode} voucher`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (user?.role === 'Employee') {
      navigate('/employee/my-vouchers');
    } else if (user?.role === 'Director') {
      navigate('/director/pending-approvals');
    } else {
      navigate('/accounts/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading voucher details...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-error">{error || 'Voucher not found'}</div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGoBack}
          >
            ← Return to Previous Page
          </button>
        </div>
      </div>
    );
  }

  const voucherEmployeeId = typeof voucher.employee === 'object' && voucher.employee !== null
    ? String(voucher.employee._id || voucher.employee.id || '')
    : String(voucher.employee || '');
  const currentUserId = String(user?.id || user?._id || '');
  const isOwnerEmployee = user?.role === 'Employee' && voucherEmployeeId === currentUserId;
  const isDirector = user?.role === 'Director';
  const isPending = voucher.status === 'Pending Approval';
  const isDraft = voucher.status === 'Draft';

  return (
    <div>
      {/* Top Back Navigation Bar */}
      <div style={{ marginBottom: '14px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleGoBack}
          title="Return to previous vouchers view"
        >
          ← Back to Vouchers
        </button>
      </div>

      {/* Top Header Actions */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-section-tag">Finance Record &bull; {voucher.voucherNumber}</div>
          <h1>{voucher.voucherNumber} &bull; {voucher.expenseTitle}</h1>
          <p>
            Filing Date: {formatDate(voucher.voucherDate)} &bull; Created: {formatDate(voucher.createdAt, true)}
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGoBack}
            title="Return to previous page"
          >
            ← Back
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
            title="Print formal voucher document"
          >
            🖨️ Print Voucher
          </button>

          {/* Employee Actions: Draft Only */}
          {isOwnerEmployee && isDraft && (
            <>
              <Link
                to={`/employee/edit-voucher/${voucher._id}`}
                className="btn btn-secondary"
              >
                Edit Draft
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowSubmitModal(true)}
              >
                Submit for Approval
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Draft
              </button>
            </>
          )}

          {/* Director Actions: Pending Only */}
          {isDirector && isPending && (
            <>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setApprovalModalMode('approve')}
              >
                Approve Voucher
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setApprovalModalMode('reject')}
              >
                Reject Voucher
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notice Banners */}
      {voucher.status === 'Rejected' && (
        <div className="alert alert-error">
          <div>
            <strong>Rejection Notice:</strong> Declined by{' '}
            <strong>{voucher.directorName || 'Director'}</strong>
            {voucher.rejectionDate && ` on ${formatDate(voucher.rejectionDate, true)}`}.
            <div style={{ marginTop: '2px', fontStyle: 'italic' }}>
              Reason: "{voucher.rejectionReason}"
            </div>
          </div>
        </div>
      )}

      {voucher.status === 'Approved' && (
        <div className="alert alert-success">
          <div>
            <strong>Approved for Payment:</strong> Authorized by{' '}
            <strong>{voucher.directorName || 'Director'}</strong> on{' '}
            {formatDate(voucher.approvalDate, true)}. Ready for reimbursement disbursement.
          </div>
        </div>
      )}

      {voucher.status === 'Pending Approval' && (
        <div className="alert alert-warning">
          <div>
            <strong>Pending Executive Review:</strong> Submitted and awaiting Director verification and authorization signature.
          </div>
        </div>
      )}

      {/* Financial Document Structure (7 Sections) */}
      <div className="voucher-document">
        {/* Document Masthead */}
        <div className="voucher-doc-masthead">
          <div className="voucher-doc-company">
            <h2>PRACHAY SECURITIES PRIVATE LIMITED</h2>
            <p>Expense Voucher & Reimbursement Authorization Form</p>
          </div>
          <div className="voucher-doc-meta">
            <span className="voucher-doc-number">{voucher.voucherNumber}</span>
            <span className="voucher-doc-date">Filing Date: {formatDate(voucher.voucherDate)}</span>
            <div style={{ marginTop: '4px' }}>
              <StatusBadge status={voucher.status} />
            </div>
          </div>
        </div>

        {/* Section 1: Voucher Information */}
        <div className="voucher-section">
          <div className="voucher-section-title">
            1. Voucher Information
          </div>
          <div className="voucher-data-grid">
            <div className="voucher-data-item">
              <span className="voucher-data-label">Voucher Number</span>
              <span className="voucher-data-value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                {voucher.voucherNumber}
              </span>
            </div>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Filing Date</span>
              <span className="voucher-data-value">{formatDate(voucher.voucherDate)}</span>
            </div>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Submission Timestamp</span>
              <span className="voucher-data-value">{formatDate(voucher.createdAt, true)}</span>
            </div>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Current Status</span>
              <div>
                <StatusBadge status={voucher.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Employee and Department Information */}
        <div className="voucher-section">
          <div className="voucher-section-title">
            2. Employee Information
          </div>
          <div className="voucher-data-grid">
            <div className="voucher-data-item">
              <span className="voucher-data-label">Claimant Employee Name</span>
              <span className="voucher-data-value">{voucher.employeeName}</span>
            </div>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Employee ID</span>
              <span className="voucher-data-value">{voucher.employeeId || 'N/A'}</span>
            </div>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Department</span>
              <span className="voucher-data-value">{voucher.departmentName}</span>
            </div>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Organization Unit</span>
              <span className="voucher-data-value">Prachay Securities Pvt Ltd</span>
            </div>
          </div>
        </div>

        {/* Section 3: Expense Details */}
        <div className="voucher-section">
          <div className="voucher-section-title">
            3. Expense Details
          </div>
          <div className="voucher-data-grid" style={{ marginBottom: '14px' }}>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Expense Date</span>
              <span className="voucher-data-value">{formatDate(voucher.expenseDate)}</span>
            </div>
            <div className="voucher-data-item">
              <span className="voucher-data-label">Expense Category</span>
              <span className="voucher-data-value">
                <span
                  style={{
                    backgroundColor: 'var(--color-bg-subtle)',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {voucher.expenseCategory}
                </span>
              </span>
            </div>
            <div className="voucher-data-item" style={{ gridColumn: 'span 2' }}>
              <span className="voucher-data-label">Total Claim Amount</span>
              <span className="voucher-amount-highlight">{formatCurrency(voucher.amount)}</span>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <span className="voucher-data-label">Expense Title</span>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#202020', marginTop: '2px' }}>
              {voucher.expenseTitle}
            </div>
          </div>

          <div>
            <span className="voucher-data-label">Itemized Description & Justification</span>
            <div
              style={{
                marginTop: '4px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '13px',
                lineHeight: 1.5,
                color: voucher.expenseDescription ? '#202020' : 'var(--color-text-secondary)'
              }}
            >
              {voucher.expenseDescription || 'No itemized justification provided.'}
            </div>
          </div>
        </div>

        {/* Sections 4 & 5 & 6 & 7: Signatures and Audit Trail */}
        <div className="voucher-signatures-grid">
          {/* Section 4: Employee Signature */}
          <div className="signature-card">
            <div className="signature-card-title">
              4. Employee Signature
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Certified business expenditure incurred on behalf of PSPL.
            </div>
            <div style={{ fontSize: '12px', marginBottom: '6px' }}>
              Claimant: <strong>{voucher.employeeName}</strong>
            </div>

            <div className="signature-preview-box" style={{ margin: 0, maxWidth: '100%' }}>
              {voucher.employeeSignature ? (
                <img
                  src={getAuthSigUrl(voucher.employeeSignature)}
                  alt="Employee Signature"
                  className="signature-preview-img"
                />
              ) : (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                  No employee signature attached
                </span>
              )}
            </div>
          </div>

          {/* Section 5 & 6: Director Approval Details & Signature */}
          <div className="signature-card">
            <div className="signature-card-title">
              5 & 6. Director Approval & Signature
            </div>

            {voucher.status === 'Approved' ? (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--status-approved-text)', fontWeight: 600, marginBottom: '6px' }}>
                  ✓ Approved for Reimbursement
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Approved By: <strong>{voucher.directorName || 'Director'}</strong>
                </div>
                <div style={{ fontSize: '11.5px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                  Approval Date: {formatDate(voucher.approvalDate, true)}
                </div>

                <div className="signature-preview-box" style={{ margin: 0, maxWidth: '100%' }}>
                  {voucher.directorSignature ? (
                    <img
                      src={getAuthSigUrl(voucher.directorSignature)}
                      alt="Director Signature"
                      className="signature-preview-img"
                    />
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                      Director signature recorded in audit system
                    </span>
                  )}
                </div>
              </div>
            ) : voucher.status === 'Rejected' ? (
              <div>
                {/* Section 7: Rejection Reason and Date */}
                <div style={{ fontSize: '12px', color: 'var(--status-rejected-text)', fontWeight: 700, marginBottom: '6px' }}>
                  ✕ Claim Rejected by Director
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Reviewed By: <strong>{voucher.directorName || 'Director'}</strong>
                </div>
                {voucher.rejectionDate && (
                  <div style={{ fontSize: '11.5px', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Rejection Date: {formatDate(voucher.rejectionDate, true)}
                  </div>
                )}
                <div style={{ marginTop: '6px' }}>
                  <span className="voucher-data-label">7. Stated Rejection Reason</span>
                  <div
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--status-rejected-bg)',
                      border: '1px solid var(--status-rejected-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--status-rejected-text)',
                      fontSize: '12px',
                      lineHeight: 1.4,
                      marginTop: '4px'
                    }}
                  >
                    "{voucher.rejectionReason}"
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                {voucher.status === 'Draft'
                  ? 'Draft status. Signature and submission required.'
                  : 'Awaiting Director review and authorization signature.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation & Approval Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Draft Voucher"
        message={`Are you sure you want to permanently delete draft voucher "${voucher.voucherNumber}"?`}
        confirmText="Delete Voucher"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDeleteDraft}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmModal
        isOpen={showSubmitModal}
        title="Submit Voucher for Director Approval"
        message={`Submit voucher "${voucher.voucherNumber}" for ₹${voucher.amount.toLocaleString('en-IN')}? Once submitted, this claim becomes read-only and queued for Director approval.`}
        confirmText="Confirm & Submit"
        confirmVariant="primary"
        isLoading={actionLoading}
        onConfirm={handleSubmitVoucher}
        onCancel={() => setShowSubmitModal(false)}
      />

      <ApprovalModal
        isOpen={!!approvalModalMode}
        mode={approvalModalMode || 'approve'}
        voucher={voucher}
        isLoading={actionLoading}
        onConfirm={handleDirectorAction}
        onCancel={() => setApprovalModalMode(null)}
      />
    </div>
  );
};

export default VoucherDetailsPage;
