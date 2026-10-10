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
        setError('Director signature is mandatory to approve an expense voucher.');
        return;
      }
      onConfirm({ directorSignature: signature });
    } else {
      if (!rejectionReason.trim()) {
        setError('A rejection reason is mandatory when rejecting a voucher.');
        return;
      }
      onConfirm({ rejectionReason: rejectionReason.trim() });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '580px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3 className="modal-title">
              {mode === 'approve' ? 'Approve Expense Voucher' : 'Reject Expense Voucher'}
            </h3>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onCancel}
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Voucher Details</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-navy-dark)' }}>
                {voucher.voucherNumber} — {voucher.expenseTitle}
              </div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                Employee: <strong>{voucher.employeeName}</strong> | Amount:{' '}
                <strong>₹{Number(voucher.amount || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {mode === 'approve' ? (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                  By approving this voucher, you authorize the expense reimbursement. Please provide your Director signature below.
                </p>
                <SignatureUpload
                  label="Director Signature"
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
                  placeholder="Specify the exact reason for rejecting this voucher (e.g. Missing valid tax invoice, amount exceeds department allowance, non-business expense)..."
                  required
                />
                <div className="form-helper">
                  This explanation will be permanently recorded and visible to the employee.
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
                ? 'Confirm & Approve Voucher'
                : 'Confirm & Reject Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;
