import React, { useState } from 'react';
import SignatureUpload from './SignatureUpload';

const ApprovalModal = ({
  isOpen,
  mode = 'approve', // 'approve' | 'reject'
  voucher,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [signature, setSignature] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !voucher) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'approve') {
      if (!signature) {
        setError('A Director signature is strictly mandatory to authorize this voucher.');
        return;
      }
      onConfirm({ directorSignature: signature });
    } else {
      if (!rejectionReason.trim()) {
        setError('An explicit rejection reason is required.');
        return;
      }
      onConfirm({ rejectionReason: rejectionReason.trim() });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '540px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3 className="modal-title">
              {mode === 'approve' ? 'Authorize Expense Voucher' : 'Reject Expense Claim'}
            </h3>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onCancel}
              disabled={isLoading}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div style={{ marginBottom: '16px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)' }}>
                Target Voucher
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-main)', marginTop: '2px' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{voucher.voucherNumber}</span> — {voucher.expenseTitle}
              </div>
              <div style={{ fontSize: '12.5px', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                Claimant: <strong style={{ color: 'var(--color-text-main)' }}>{voucher.employeeName}</strong> &bull; Amount:{' '}
                <strong style={{ color: 'var(--color-text-main)' }}>₹{Number(voucher.amount || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {mode === 'approve' ? (
              <div>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                  By providing authorization, you confirm that this expense claim complies with company financial policies and authorize disbursement.
                </p>
                <SignatureUpload
                  label="Director Authorization Signature"
                  required={true}
                  value={signature}
                  onChange={setSignature}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  Rejection Reason <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State the specific audit or compliance reason for rejection (e.g. Ineligible business expense, exceeds travel allowance cap, missing invoice receipt)..."
                  required
                />
                <div className="form-helper">
                  This justification will be permanently saved to the voucher audit trail and displayed to the claimant.
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${mode === 'approve' ? 'btn-success' : 'btn-danger'}`}
              disabled={isLoading}
            >
              {isLoading
                ? 'Processing...'
                : mode === 'approve'
                ? 'Authorize & Approve'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;
