import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditVoucherPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [formData, setFormData] = useState({
    expenseDate: '',
    departmentName: '',
    expenseTitle: '',
    expenseCategory: '',
    expenseDescription: '',
    amount: '',
    employeeSignature: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await voucherAPI.getVoucherById(id);
        if (res.success && res.voucher) {
          const v = res.voucher;
          if (v.status !== 'Draft') {
            setError(`Cannot edit voucher with status "${v.status}". Only Draft vouchers can be modified.`);
          }
          setVoucher(v);
          setFormData({
            expenseDate: v.expenseDate ? new Date(v.expenseDate).toISOString().split('T')[0] : '',
            departmentName: v.departmentName || '',
            expenseTitle: v.expenseTitle || '',
            expenseCategory: v.expenseCategory || 'Other',
            expenseDescription: v.expenseDescription || '',
            amount: v.amount || '',
            employeeSignature: v.employeeSignature || ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load voucher details');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id]);

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

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    try {
      setSaving(true);
      const res = await voucherAPI.updateVoucher(id, {
        ...formData,
        amount: parsedAmount
      });
      if (res.success) {
        navigate(`/employee/vouchers/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update draft voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.departmentName.trim()) {
      setError('Department is required.');
      return;
    }
    if (!formData.expenseTitle.trim()) {
      setError('Expense Title is required.');
      return;
    }
    if (!formData.expenseDate) {
      setError('Expense Date is required.');
      return;
    }
    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!formData.employeeSignature) {
      setError('Employee signature must be uploaded before submission.');
      return;
    }

    try {
      setSaving(true);
      const res = await voucherAPI.submitVoucher(id, {
        ...formData,
        amount: parsedAmount
      });
      if (res.success) {
        navigate(`/employee/vouchers/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit voucher for approval');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading voucher...</p>
      </div>
    );
  }

  if (voucher && voucher.status !== 'Draft') {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-error">
            {error || 'This voucher cannot be edited because it is no longer in Draft status.'}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/employee/vouchers/${id}`)}
          >
            ← Back to Voucher Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Edit Draft Voucher: {voucher?.voucherNumber}</h1>
          <p>Modify expense line items or attach your signature prior to final submission.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Draft Edit Form</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Voucher #{voucher?.voucherNumber}
          </span>
        </div>

        <div className="card-body">
          <form>
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
                value={formData.expenseDescription}
                onChange={handleChange}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />

            <SignatureUpload
              label="Employee Signature"
              value={formData.employeeSignature}
              onChange={handleSignatureChange}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => navigate('/employee/my-vouchers')}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn btn-secondary"
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Update Draft'}
              </button>
              <button
                type="button"
                onClick={handleSubmitForApproval}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Submitting...' : '🚀 Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVoucherPage;
