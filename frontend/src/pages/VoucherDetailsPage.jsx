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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approvalModalMode, setApprovalModalMode] = useState(null); // 'approve' | 'reject' | null
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
      alert('An employee signature must be attached before submitting. Please click Edit to upload your signature.');
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

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Loading voucher specifications...</p>
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
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnerEmployee = user?.role === 'Employee' && voucher.employee === user.id;
  const isDirector = user?.role === 'Director';
  const isPending = voucher.status === 'Pending Approval';
  const isDraft = voucher.status === 'Draft';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1>Voucher: {voucher.voucherNumber}</h1>
            <StatusBadge status={voucher.status} />
          </div>
          <p>
            Voucher Date: {formatDate(voucher.voucherDate)} | Created: {formatDate(voucher.createdAt, true)}
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
          >
            🖨️ Print Voucher
          </button>

          {/* Employee Actions */}
          {user?.role === 'Employee' && isDraft && (
            <>
              <Link
                to={`/employee/edit-voucher/${voucher._id}`}
                className="btn btn-primary"
              >
                ✏️ Edit Draft
              </Link>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setShowSubmitModal(true)}
              >
                🚀 Submit for Approval
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Delete Draft
              </button>
            </>
          )}

          {/* Director Actions (Only when Pending Approval) */}
          {isDirector && isPending && (
            <>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setApprovalModalMode('approve')}
              >
                ✓ Approve Voucher
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setApprovalModalMode('reject')}
              >
                ✕ Reject Voucher
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Notice Banner */}
      {voucher.status === 'Rejected' && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <div>
            <strong>Rejection Notice:</strong> This voucher was rejected by{' '}
            <strong>{voucher.directorName || 'the Director'}</strong>.
            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
              Reason: "{voucher.rejectionReason}"
            </div>
          </div>
        </div>
      )}

      {voucher.status === 'Approved' && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <div>
            <strong>Approval Authorized:</strong> Approved by{' '}
            <strong>{voucher.directorName || 'Director'}</strong> on{' '}
            {formatDate(voucher.approvalDate, true)}. Ready for reimbursement disbursement.
          </div>
        </div>
      )}

      {voucher.status === 'Pending Approval' && (
        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          <div>
            <strong>Pending Executive Review:</strong> This voucher is awaiting official review and signature by the Director.
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Expense Specifics */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Expense Particulars</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Expense Title
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy-dark)', marginTop: '2px' }}>
                  {voucher.expenseTitle}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Expense Date
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                    {formatDate(voucher.expenseDate)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Department
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                    {voucher.departmentName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Expense Category
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      {voucher.expenseCategory}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Claim Amount
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                    {formatCurrency(voucher.amount)}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Expense Description & Justification
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: voucher.expenseDescription ? 'var(--color-text-main)' : 'var(--color-text-muted)'
                  }}
                >
                  {voucher.expenseDescription || 'No additional remarks provided.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Signatures & Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Employee Section */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h2 className="card-title">Employee Submission</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Claimant Name
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                    {voucher.employeeName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Employee ID
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                    {voucher.employeeId || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                  Employee Signature
                </div>
                {voucher.employeeSignature ? (
                  <div className="signature-preview-box" style={{ margin: 0 }}>
                    <img
                      src={voucher.employeeSignature}
                      alt="Employee Signature"
                      className="signature-preview-img"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: '13px'
                    }}
                  >
                    No employee signature attached (Required before submission)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Director Approval / Rejection Section */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h2 className="card-title">Director Authorization</h2>
            </div>
            <div className="card-body">
              {voucher.status === 'Approved' ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Approved By
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                        {voucher.directorName || 'Director'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Approval Date
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                        {formatDate(voucher.approvalDate, true)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      Director Signature
                    </div>
                    {voucher.directorSignature ? (
                      <div className="signature-preview-box" style={{ margin: 0 }}>
                        <img
                          src={voucher.directorSignature}
                          alt="Director Signature"
                          className="signature-preview-img"
                        />
                      </div>
                    ) : (
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        Signature recorded in audit log
                      </div>
                    )}
                  </div>
                </div>
              ) : voucher.status === 'Rejected' ? (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Rejected By
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                      {voucher.directorName || 'Director'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Stated Rejection Reason
                    </div>
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '12px',
                        backgroundColor: '#fee2e2',
                        borderRadius: '6px',
                        color: '#991b1b',
                        fontSize: '13px',
                        lineHeight: 1.5
                      }}
                    >
                      {voucher.rejectionReason}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '13px'
                  }}
                >
                  {voucher.status === 'Draft'
                    ? 'Awaiting employee finalization and submission.'
                    : 'Awaiting Director review and authorization signature.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
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
        message={`Submit voucher "${voucher.voucherNumber}" for ₹${voucher.amount.toLocaleString('en-IN')}? Once submitted, it will become read-only and queued for Director approval.`}
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
