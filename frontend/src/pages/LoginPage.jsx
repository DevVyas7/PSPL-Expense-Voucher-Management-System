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

    // Frontend validation
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);

      // Role-based redirection
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

  // Helper to prefill demonstration credentials for effortless testing
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
          <p>Expense Voucher Management System</p>
        </div>

        <div className="login-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address <span className="required">*</span>
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
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    className="spinner"
                    style={{ width: '18px', height: '18px', borderWidth: '2px' }}
                  />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Demonstration Quick-Fill Helper */}
          <div className="demo-credentials-box">
            <div className="demo-credentials-title">
              <span>⚡</span> Quick Demo Accounts
            </div>
            <div className="demo-btn-group">
              <button
                type="button"
                className="btn-demo-pill"
                onClick={() => handleQuickFill('employee@prachay.com')}
                title="Rahul Sharma (Employee)"
              >
                Employee
              </button>
              <button
                type="button"
                className="btn-demo-pill"
                onClick={() => handleQuickFill('director@prachay.com')}
                title="Ananya Deshmukh (Director)"
              >
                Director
              </button>
              <button
                type="button"
                className="btn-demo-pill"
                onClick={() => handleQuickFill('accounts@prachay.com')}
                title="Vikram Patel (Accounts Team)"
              >
                Accounts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
