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
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
      <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--color-navy-dark)' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 0 24px 0', fontSize: '15px' }}>
        The page or expense voucher resource you requested does not exist or may have been relocated.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
