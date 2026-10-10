import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voucherAPI } from '../services/api';
import SignatureUpload from '../components/SignatureUpload';

const departmentsList = [
  'Finance',
  'Human Resources',
  'Technology',
  'Marketing',
  'Operations',
  'Investment Banking',
  'Research & Equity',
  'IT & Systems',
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

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const CreateVoucherPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => ({
    voucherDate: getTodayDateString(),
    expenseDate: getTodayDateString(),
    departmentName: user?.department || 'Finance',
    expenseTitle: '',
    expenseCategory: 'Travel',
    expenseDescription: '',
    amount: '',
    employeeSignature: ''
  }));

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

  // 1. Save as Draft (Signature optional)
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.expenseTitle.trim()) {
      setError('Please provide an expense title to save as a draft.');
      return;
    }

    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid claim amount greater than zero.');
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

  // 2. Submit for Approval (Signature mandatory)
  const handleSubmitForApproval = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.departmentName.trim()) {
      setError('Department selection is required.');
      return;
    }

    if (!formData.expenseTitle.trim()) {
      setError('Expense title is required.');
      return;
    }

    if (!formData.expenseDate) {
      setError('Expense date is required.');
      return;
    }

    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a valid number greater than zero.');
      return;
    }

    if (!formData.employeeSignature) {
      setError('An employee signature is mandatory before submitting for Director approval.');
      return;
    }

    try {
      setSubmitting(true);
      const createRes = await voucherAPI.createVoucher({
        ...formData,
        amount: parsedAmount
      });

      if (createRes.success && createRes.voucher?._id) {
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
          <div className="page-section-tag">New Bill &bull; Reimbursement</div>
          <h1>Create Expense Voucher</h1>
          <p>Submit business expense details for executive review and reimbursement authorization.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Expense Claim Form</h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Initial State: Draft
          </span>
        </div>

        <div className="card-body">
          <form>
            {/* Section 1: Identification */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#202020', marginBottom: '10px' }}>
                1. Claimant & Voucher Identification
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Voucher Reference Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value="Auto-assigned upon save (e.g. EXP-2026-0001)"
                    readOnly
                    disabled
                  />
                  <span className="form-helper">Sequential unique audit number</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Filing Date</label>
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
                  <label className="form-label">Claimant Employee Name</label>
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
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

            {/* Section 2: Expense Particulars */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#202020', marginBottom: '10px' }}>
                2. Expense Details & Justification
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Expense Incurred Date <span className="required">*</span>
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
                    Allocated Department <span className="required">*</span>
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
                    Claim Amount (₹) <span className="required">*</span>
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
                  Expense Title / Purpose <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="expenseTitle"
                  className="form-control"
                  placeholder="e.g. Travel allowance for Mumbai client review"
                  value={formData.expenseTitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Itemized Description & Business Justification</label>
                <textarea
                  name="expenseDescription"
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe the business purpose, itemized expenses, client meetings, or justification..."
                  value={formData.expenseDescription}
                  onChange={handleChange}
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

            {/* Section 3: Attestation & Signature */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#202020', marginBottom: '10px' }}>
                3. Attestation & Claimant Signature
              </div>

              <SignatureUpload
                label="Employee Claimant Signature"
                required={false}
                value={formData.employeeSignature}
                onChange={handleSignatureChange}
              />
              <div className="form-helper" style={{ marginTop: '4px' }}>
                Note: A signature is optional when saving as a Draft, but strictly required before submitting for Director approval.
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
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
                {submitting ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="button"
                onClick={handleSubmitForApproval}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVoucherPage;
