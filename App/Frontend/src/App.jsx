import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { Toaster } from './components/ui/toaster';
import { Navbar } from './components/general/Navbar.jsx';
import { HomePage } from './Pages/HomePage.jsx';
import { LoginPage } from './Pages/Authentication/LoginPage.jsx';
import { RegisterPage } from './Pages/Authentication/RegisterPage.jsx';
import { ForgotPasswordPage } from './Pages/Authentication/ForgotPasswordPage';
import ChangePasswordPage from './Pages/Authentication/ChangePasswordPage.jsx';
import { CollegeRegistrationPage } from './Pages/Authentication/CollegeRegistrationPage.jsx';
import { InboxPage } from './Pages/InboxPage.jsx';
import { ProfilePage } from './Pages/ProfilePage.jsx';
import { SettingsPage } from './Pages/SettingsPage.jsx';
import { fetchAuthProfile } from './store/auth.slice.js';
import StudentDashboard from './Pages/Student/Dashboard.page.jsx';
import StudentAdminPanel from './Pages/Student/AdminPanel.page.jsx';
import SponsorDashboard from './Pages/Sponsor/Dashboard.page.jsx';
import SponsorAdminPanel from './Pages/Sponsor/AdminPanel.page.jsx';
import OrganizerDashboard from './Pages/Organizer/Dashboard.page.jsx';
import OrganizerAdminPanel from './Pages/Organizer/AdminPanel.page.jsx';
import AdminControlPanel from './Pages/Admin/ControlPanel.page.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user has the required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      student: '/student/dashboard',
      organizer: '/organizer/dashboard',
      sponsor: '/sponsor/dashboard',
      admin: '/admin/control-panel',
    };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return <>{children}</>;
};



// App Layout for new UI
const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {/* <Toaster /> */}
    </>
  );
};



// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      dispatch(fetchAuthProfile());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/events" element={<EventListingPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/sponsors" element={<SponsorListingPage />} /> */}
      <Route path="/register-college" element={<CollegeRegistrationPage />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Common Protected Routes */}
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/admin"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Organizer Routes */}
      <Route
        path="/organizer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/admin"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerAdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Sponsor Routes */}
      <Route
        path="/sponsor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['sponsor']}>
            <SponsorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sponsor/admin"
        element={
          <ProtectedRoute allowedRoles={['sponsor']}>
            <SponsorAdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/control-panel"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminControlPanel />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-black mb-4 text-gray-300">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <a href="/" className="text-purple-600 hover:underline">
                ← Back to Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// Main App Component
export default function App() {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
}

export const CURRENT_USER_EMAIL = "admin@example.com";
