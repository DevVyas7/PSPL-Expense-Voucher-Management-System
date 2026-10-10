import React, { useState, useRef, useEffect } from 'react';
import { uploadAPI } from '../services/api';

const SignatureUpload = ({
  value,
  onChange,
  label = 'Signature',
  required = false,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'draw'
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(value || '');

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  // Handle File Input Selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP image files are allowed.');
      return;
    }

    // Validate size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds the 2 MB limit. Please select a smaller image.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadAPI.uploadSignature(file);
      if (res.success && res.fileUrl) {
        setPreviewUrl(res.fileUrl);
        onChange(res.fileUrl);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to upload signature. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveCanvasSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      setError('Please draw a signature before applying.');
      return;
    }

    setError('');
    setIsUploading(true);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsUploading(false);
        setError('Failed to capture canvas signature.');
        return;
      }

      const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });

      try {
        const res = await uploadAPI.uploadSignature(file);
        if (res.success && res.fileUrl) {
          setPreviewUrl(res.fileUrl);
          onChange(res.fileUrl);
          setActiveTab('upload');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to upload drawn signature');
      } finally {
        setIsUploading(false);
      }
    }, 'image/png');
  };

  const handleClearSignature = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>

      {readOnly ? (
        <div className="signature-preview-box">
          {previewUrl ? (
            <img src={previewUrl} alt="Signature" className="signature-preview-img" />
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
              No signature on file
            </span>
          )}
        </div>
      ) : (
        <div className="signature-section">
          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Image File
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('draw')}
            >
              Draw Digital Signature
            </button>
          </div>

          {error && <div className="alert alert-error" style={{ padding: '8px 12px' }}>{error}</div>}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="signature-file-input"
              />

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label
                  htmlFor="signature-file-input"
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
                >
                  {isUploading ? 'Uploading...' : 'Choose File (JPEG, PNG, WebP)'}
                </label>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="btn btn-outline-danger btn-sm"
                  >
                    Remove Signature
                  </button>
                )}
              </div>
              <div className="form-helper">
                Accepts JPEG, PNG, WebP up to 2 MB.
              </div>
            </div>
          )}

          {/* Draw Tab */}
          {activeTab === 'draw' && (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 8px 0' }}>
                Draw your signature in the box below using mouse, pen, or touch:
              </p>
              <canvas
                ref={canvasRef}
                width={360}
                height={130}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={saveCanvasSignature}
                  disabled={!hasDrawn || isUploading}
                >
                  {isUploading ? 'Saving...' : 'Apply Drawn Signature'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={clearCanvas}
                >
                  Clear Pad
                </button>
              </div>
            </div>
          )}

          {/* Current Saved Preview */}
          {previewUrl && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Current Signature Preview:
              </div>
              <div className="signature-preview-box">
                <img src={previewUrl} alt="Signature Preview" className="signature-preview-img" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignatureUpload;
