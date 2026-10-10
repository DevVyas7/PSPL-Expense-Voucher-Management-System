import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      setError('Amount must be a valid number greater than zero.');
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
      setError('Expense title is required.');
      return;
    }

    if (!formData.expenseDate) {
      setError('Expense date is required.');
      return;
    }

    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (!formData.employeeSignature) {
      setError('An employee signature is strictly required before submitting for Director approval.');
      return;
    }

    try {
      setSaving(true);
      const updateRes = await voucherAPI.updateVoucher(id, {
        ...formData,
        amount: parsedAmount
      });

      if (updateRes.success) {
        const submitRes = await voucherAPI.submitVoucher(id);
        if (submitRes.success) {
          navigate(`/employee/vouchers/${id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit voucher');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading draft voucher data...</p>
      </div>
    );
  }

  if (voucher && voucher.status !== 'Draft') {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-error">
            Cannot edit voucher "{voucher.voucherNumber}" with status "{voucher.status}". Only Draft vouchers can be modified.
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/employee/vouchers/${id}`)}
          >
            ← View Voucher Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-section-tag">Draft Revision &bull; {voucher?.voucherNumber}</div>
          <h1>Edit Draft Voucher</h1>
          <p>Modify expense particulars or attach signature before submitting for Director approval.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Edit Voucher Form</h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Status: Draft
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
                    value={voucher?.voucherNumber || ''}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Claimant Employee Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={voucher?.employeeName || ''}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={voucher?.employeeId || 'N/A'}
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
                  value={formData.expenseTitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Itemized Description & Justification</label>
                <textarea
                  name="expenseDescription"
                  className="form-textarea"
                  rows={3}
                  value={formData.expenseDescription}
                  onChange={handleChange}
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

            {/* Section 3: Signature */}
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
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => navigate(`/employee/vouchers/${id}`)}
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
                {saving ? 'Updating...' : 'Save Draft Updates'}
              </button>

              <button
                type="button"
                onClick={handleSubmitForApproval}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVoucherPage;
