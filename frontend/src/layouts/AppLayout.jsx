import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getSectionLabel = () => {
    if (!user) return 'Vouchers';
    if (user.role === 'Employee') return 'Employee Portal';
    if (user.role === 'Director') return 'Director Approvals';
    if (user.role === 'Accounts Team') return 'Accounting & Ledger';
    return 'Finance';
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div className="sidebar-overlay" onClick={closeMobileMenu} />
        )}

        {/* Vertical Left Sidebar (Warm Stone #F3F2EF) */}
        <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand-wrapper">
              <div className="company-logo">P</div>
              <div className="company-brand-info">
                <h2>PSPL</h2>
                <p>Prachay Securities</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {/* Employee Navigation */}
            {user?.role === 'Employee' && (
              <>
                <div className="nav-section-title">Navigation</div>
                <NavLink
                  to="/employee/dashboard"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">📊</span>
                    <span>Dashboard</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/employee/my-vouchers"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">📑</span>
                    <span>My Vouchers</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/employee/create-voucher"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">+</span>
                    <span>Create Voucher</span>
                  </div>
                </NavLink>
              </>
            )}

            {/* Director Navigation */}
            {user?.role === 'Director' && (
              <>
                <div className="nav-section-title">Executive</div>
                <NavLink
                  to="/director/dashboard"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">📊</span>
                    <span>Dashboard</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/director/pending-approvals"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">⏳</span>
                    <span>Approvals</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/director/all-vouchers"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">📑</span>
                    <span>All Vouchers</span>
                  </div>
                </NavLink>
              </>
            )}

            {/* Accounts Team Navigation (Strictly Read-Only) */}
            {user?.role === 'Accounts Team' && (
              <>
                <div className="nav-section-title">Accounting</div>
                <NavLink
                  to="/accounts/dashboard"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">📊</span>
                    <span>Dashboard</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/accounts/all-vouchers"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">📑</span>
                    <span>Expense Records</span>
                  </div>
                </NavLink>
              </>
            )}
          </nav>

          {/* User Profile Footer */}
          <div className="sidebar-footer">
            <div className="user-profile-badge">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role-tag">{user?.role}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace (Pure White) */}
        <div className="app-main">
          <header className="app-topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation"
              >
                ☰
              </button>
              <div className="topbar-breadcrumb">
                <span>{getSectionLabel()}</span> &bull; <span>Prachay Securities</span>
              </div>
            </div>

            <div className="topbar-right">
              <span className="role-pill">
                {user?.role}
              </span>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                title="Sign out of system"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </header>

          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
