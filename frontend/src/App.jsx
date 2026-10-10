import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CreateVoucherPage from './pages/CreateVoucherPage';
import MyVouchersPage from './pages/MyVouchersPage';
import EditVoucherPage from './pages/EditVoucherPage';
import DirectorDashboard from './pages/DirectorDashboard';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import AllVouchersPage from './pages/AllVouchersPage';
import AccountsDashboard from './pages/AccountsDashboard';
import VoucherDetailsPage from './pages/VoucherDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

// Root redirect handler based on authentication and role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p>Loading application session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Employee') {
    return <Navigate to="/employee/dashboard" replace />;
  } else if (user.role === 'Director') {
    return <Navigate to="/director/dashboard" replace />;
  } else if (user.role === 'Accounts Team') {
    return <Navigate to="/accounts/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Employee Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/create-voucher" element={<CreateVoucherPage />} />
            <Route path="/employee/my-vouchers" element={<MyVouchersPage />} />
            <Route path="/employee/edit-voucher/:id" element={<EditVoucherPage />} />
            <Route path="/employee/vouchers/:id" element={<VoucherDetailsPage />} />
          </Route>

          {/* Director Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['Director']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/director/dashboard" element={<DirectorDashboard />} />
            <Route path="/director/pending-approvals" element={<PendingApprovalsPage />} />
            <Route path="/director/all-vouchers" element={<AllVouchersPage />} />
            <Route path="/director/vouchers/:id" element={<VoucherDetailsPage />} />
          </Route>

          {/* Accounts Team Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['Accounts Team']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
            <Route path="/accounts/all-vouchers" element={<AllVouchersPage />} />
            <Route path="/accounts/vouchers/:id" element={<VoucherDetailsPage />} />
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
