import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);

      const destination =
        location.state?.from?.pathname ||
        (loggedUser.role === 'Employee'
          ? '/employee/dashboard'
          : loggedUser.role === 'Director'
          ? '/director/dashboard'
          : '/accounts/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">P</div>
          <h1>Prachay Securities Private Limited</h1>
          <p>Expense Voucher & Claim Portal</p>
        </div>

        <div className="login-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Corporate Email Address <span className="required">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@prachay.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password <span className="required">*</span>
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px', height: '38px', fontSize: '13.5px' }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    className="spinner"
                    style={{ width: '16px', height: '16px', borderWidth: '2px' }}
                  />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In to System'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="demo-credentials-box">
            <div className="demo-credentials-title">
              <span>⚡</span> Quick Demonstration Logins
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label
                htmlFor="demo-employee-select"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Select Employee Account:
              </label>
              <select
                id="demo-employee-select"
                className="form-select"
                style={{
                  fontSize: '12px',
                  padding: '5px 8px',
                  height: '32px',
                  backgroundColor: '#ffffff'
                }}
                value={
                  email.endsWith('@prachay.com') &&
                  email !== 'director@prachay.com' &&
                  email !== 'accounts@prachay.com'
                    ? email
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) handleQuickFill(e.target.value);
                }}
              >
                <option value="">Choose Employee Demo...</option>
                <option value="rahul@prachay.com">Rahul Sharma &bull; Finance (PSPL-EMP-1001)</option>
                <option value="priya@prachay.com">Priya Patel &bull; Human Resources (PSPL-EMP-1002)</option>
                <option value="arjun@prachay.com">Arjun Mehta &bull; Technology (PSPL-EMP-1003)</option>
                <option value="neha@prachay.com">Neha Desai &bull; Marketing (PSPL-EMP-1004)</option>
                <option value="amit@prachay.com">Amit Verma &bull; Operations (PSPL-EMP-1005)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn-demo-pill"
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => handleQuickFill('director@prachay.com')}
                title="Ananya Deshmukh (Director)"
              >
                Director
              </button>
              <button
                type="button"
                className="btn-demo-pill"
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => handleQuickFill('accounts@prachay.com')}
                title="Vikram Patel (Accounts Team)"
              >
                Accounts Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
