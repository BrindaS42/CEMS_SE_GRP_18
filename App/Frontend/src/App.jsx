import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from './Components/ui/sonner';
import { Navbar } from './Components/general/Navbar.jsx';
import { ThemeProvider } from './utils/ThemeContext';
import { HomePage } from './Pages/HomePage.jsx';
import { LoginPage } from './Pages/Authentication/LoginPage.jsx';
import { RegisterPage } from './Pages/Authentication/RegisterPage.jsx';
import { ForgotPasswordPage } from './Pages/Authentication/ForgotPasswordPage';
import ChangePasswordPage from './Pages/Authentication/ChangePasswordPage.jsx';
import { CollegeRegistrationPage } from './Pages/Authentication/CollegeRegistrationPage.jsx';
import { InboxPage } from './Pages/InboxPage.jsx';
import { ProfilePage } from './Pages/ProfilePage.jsx';
import { SettingsPage } from './Pages/SettingsPage.jsx';
import { fetchAuthProfile } from './Store/auth.slice.js';
import StudentDashboard from './Pages/Student/Dashboard.page.jsx';
import StudentAdminPanel from './Pages/Student/AdminPanel.page.jsx';
import SponsorAdminPanel from './Pages/Sponsor/AdminPanel.page.jsx';
import OrganizerDashboard from './Pages/Organizer/Dashboard.page.jsx';
import OrganizerAdminPanel from './Pages/Organizer/AdminPanel.page.jsx';
import AdminControlPanel from './Pages/Admin/ControlPanel.page.jsx';
import { socket } from './service/socket.js';
import MapWindow from './Components/EventComponents/Map/mapWindow.jsx';
import { EventListingPage } from './Pages/Event/EventListingPage.jsx';
import { EventDetailsPage } from './Pages/Event/EventDetailsPage.jsx';
import { SponsorListingPage } from './Pages/SponsorListings/SponsorListingPage.jsx';
import { SearchResultsPage } from './Pages/SearchResultsPage.jsx';
import AdDetailsPage from './Pages/SponsorListings/AdDetailsPage.jsx';
import { SponsorDetailsPage } from './Pages/SponsorListings/SponsorDetailsPage.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const roleRedirects = {
      student: '/student/dashboard',
      organizer: '/organizer/dashboard',
      sponsor: '/sponsor/admin',
      admin: '/admin/control-panel',
    };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return <>{children}</>;
};

// App Layout
const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Toaster />
    </>
  );
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Global Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventListingPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/sponsors" element={<SponsorListingPage />} />
      <Route path="/sponsors/:id" element={<SponsorDetailsPage />} />
      <Route path="/ads/:id" element={<AdDetailsPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
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
            <InboxPage 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <ProfilePage 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/admin"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAdminPanel 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          </ProtectedRoute>
        }
      />

      {/* Organizer Routes */}
      <Route
        path="/organizer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboard 
              isSidebarCollapsed={isSidebarCollapsed} 
              onToggleSidebar={toggleSidebar} 
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/admin"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerAdminPanel 
              isSidebarCollapsed={isSidebarCollapsed} 
              onToggleSidebar={toggleSidebar} 
            />
          </ProtectedRoute>
        }
      />

      {/* Sponsor Routes */}
      <Route
        path="/sponsor/admin"
        element={
          <ProtectedRoute allowedRoles={['sponsor']}>
            <SponsorAdminPanel 
              isSidebarCollapsed={isSidebarCollapsed} 
              onToggleSidebar={toggleSidebar} 
            />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/control-panel"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminControlPanel 
              isSidebarCollapsed={isSidebarCollapsed} 
              onToggleSidebar={toggleSidebar} 
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-location/:eventId"
        element={
          <ProtectedRoute allowedRoles={['admin', 'organizer']}>
            <MapWindow />
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

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      dispatch(fetchAuthProfile());
    }
  }, [dispatch]);

  useEffect(() => {
    const handleConnect = () => console.log('[App.jsx] ✅ Socket connected');
    const handleDisconnect = () => console.log('[App.jsx] ❌ Socket disconnected');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <ThemeProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </ThemeProvider>
  );
}

export const CURRENT_USER_EMAIL = "admin@example.com";