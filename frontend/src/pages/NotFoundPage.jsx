import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '24px'
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '14px', opacity: 0.8 }}>🔍</div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-text-main)' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.5 }}>
        The page or voucher resource you requested does not exist or may have been relocated.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Portal Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
