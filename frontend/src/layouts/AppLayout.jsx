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

  const getRoleBadgeClass = () => {
    if (!user) return '';
    if (user.role === 'Employee') return 'employee';
    if (user.role === 'Director') return 'director';
    if (user.role === 'Accounts Team') return 'accounts';
    return '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="company-logo">P</div>
          <div className="company-brand-info">
            <h2>PSPL</h2>
            <p>Expense Management</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Navigation for Employee */}
          {user?.role === 'Employee' && (
            <>
              <div className="nav-section-title">Employee Portal</div>
              <NavLink
                to="/employee/dashboard"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">📊</span>
                Dashboard
              </NavLink>
              <NavLink
                to="/employee/create-voucher"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">➕</span>
                Create Voucher
              </NavLink>
              <NavLink
                to="/employee/my-vouchers"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">📑</span>
                My Vouchers
              </NavLink>
            </>
          )}

          {/* Navigation for Director */}
          {user?.role === 'Director' && (
            <>
              <div className="nav-section-title">Director Portal</div>
              <NavLink
                to="/director/dashboard"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">📊</span>
                Dashboard
              </NavLink>
              <NavLink
                to="/director/pending-approvals"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">⏳</span>
                Pending Approvals
              </NavLink>
              <NavLink
                to="/director/all-vouchers"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">📑</span>
                All Vouchers
              </NavLink>
            </>
          )}

          {/* Navigation for Accounts Team */}
          {user?.role === 'Accounts Team' && (
            <>
              <div className="nav-section-title">Accounts Portal</div>
              <NavLink
                to="/accounts/dashboard"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">📊</span>
                Dashboard
              </NavLink>
              <NavLink
                to="/accounts/all-vouchers"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-item-icon">📑</span>
                All Vouchers
              </NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer User Info */}
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

      {/* Main Container */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              ☰
            </button>
            <h2 className="topbar-title">
              Prachay Securities Private Limited
            </h2>
          </div>

          <div className="topbar-right">
            <span className={`role-pill ${getRoleBadgeClass()}`}>
              {user?.role}
            </span>
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
              title="Sign Out"
            >
              <span>Logout</span> ⎋
            </button>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
