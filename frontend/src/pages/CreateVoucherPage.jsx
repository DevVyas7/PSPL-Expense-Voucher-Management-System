import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voucherAPI } from '../services/api';
import SignatureUpload from '../components/SignatureUpload';

const departmentsList = [
  'Investment Banking',
  'Operations',
  'Research & Equity',
  'IT & Systems',
  'Human Resources',
  'Accounts & Finance',
  'Compliance & Legal'
];

const categoriesList = [
  'Travel',
  'Food',
  'Accommodation',
  'Office Supplies',
  'Transportation',
  'Other'
];

const CreateVoucherPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    expenseDate: new Date().toISOString().split('T')[0],
    departmentName: 'Operations',
    expenseTitle: '',
    expenseCategory: 'Travel',
    expenseDescription: '',
    amount: '',
    employeeSignature: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignatureChange = (url) => {
    setFormData((prev) => ({
      ...prev,
      employeeSignature: url
    }));
  };

  // 1. Save as Draft (Signature is optional)
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.expenseTitle.trim()) {
      setError('Please provide an expense title to save as draft.');
      return;
    }

    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid amount greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await voucherAPI.createVoucher({
        ...formData,
        amount: parsedAmount
      });

      if (res.success) {
        navigate(`/employee/vouchers/${res.voucher._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft voucher');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit for Approval (Signature is mandatory along with all required fields)
  const handleSubmitForApproval = async (e) => {
    e.preventDefault();
    setError('');

    // Strict validation before submission
    if (!formData.departmentName.trim()) {
      setError('Department name is required for submission.');
      return;
    }

    if (!formData.expenseTitle.trim()) {
      setError('Expense title is required for submission.');
      return;
    }

    if (!formData.expenseDate) {
      setError('Expense date is required for submission.');
      return;
    }

    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (!formData.employeeSignature) {
      setError('Employee signature is mandatory before submitting for approval.');
      return;
    }

    try {
      setSubmitting(true);
      // Step A: Create draft
      const createRes = await voucherAPI.createVoucher({
        ...formData,
        amount: parsedAmount
      });

      if (createRes.success && createRes.voucher?._id) {
        // Step B: Submit for approval
        const submitRes = await voucherAPI.submitVoucher(createRes.voucher._id, {
          ...formData,
          amount: parsedAmount
        });

        if (submitRes.success) {
          navigate(`/employee/vouchers/${submitRes.voucher._id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Create Expense Voucher</h1>
          <p>Submit business expense details for review and reimbursement approval.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Voucher Claim Form</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Status: <span style={{ fontWeight: 600 }}>Draft (Initial)</span>
          </span>
        </div>

        <div className="card-body">
          <form>
            {/* Read-Only Top Metadata */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Voucher Number</label>
                <input
                  type="text"
                  className="form-control"
                  value="Auto-generated on save (e.g. EXP-2026-XXXX)"
                  readOnly
                  disabled
                />
                <span className="form-helper">Guaranteed unique sequence number</span>
              </div>

              <div className="form-group">
                <label className="form-label">Voucher Date</label>
                <input
                  type="date"
                  name="voucherDate"
                  className="form-control"
                  value={formData.voucherDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employee Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.name || ''}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.employeeId || 'N/A'}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />

            {/* Expense Specific Information */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Expense Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  className="form-control"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Department Name <span className="required">*</span>
                </label>
                <select
                  name="departmentName"
                  className="form-select"
                  value={formData.departmentName}
                  onChange={handleChange}
                  required
                >
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Expense Category <span className="required">*</span>
                </label>
                <select
                  name="expenseCategory"
                  className="form-select"
                  value={formData.expenseCategory}
                  onChange={handleChange}
                  required
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Amount (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Expense Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="expenseTitle"
                className="form-control"
                placeholder="e.g. Mumbai Client Presentation Travel Expenses"
                value={formData.expenseTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expense Description</label>
              <textarea
                name="expenseDescription"
                className="form-textarea"
                rows={3}
                placeholder="Provide relevant details regarding business purpose, clients met, or itemized justification..."
                value={formData.expenseDescription}
                onChange={handleChange}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />

            {/* Signature Upload / Draw */}
            <SignatureUpload
              label="Employee Signature"
              required={false}
              value={formData.employeeSignature}
              onChange={handleSignatureChange}
            />
            <div className="form-helper" style={{ marginTop: '-10px', marginBottom: '24px' }}>
              Note: You can save as a Draft without a signature. A signature is strictly required before submitting for approval.
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/employee/my-vouchers')}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn btn-secondary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : '💾 Save as Draft'}
              </button>

              <button
                type="button"
                onClick={handleSubmitForApproval}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '🚀 Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVoucherPage;
