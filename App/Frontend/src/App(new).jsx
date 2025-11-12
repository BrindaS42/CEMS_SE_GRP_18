import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from './components/ui/sonner';
import { store } from './src/store/store.js';
import { loadUserProfile } from './src/store/slices/authSlice.js';
import { Navbar } from './src/components/Navbar.jsx';
import { HomePage } from './src/pages/HomePage.jsx';
import { EventListingPage } from './src/pages/EventListingPage.jsx';
import { EventDetailsPage } from './src/pages/EventDetailsPage.jsx';
import { InboxPage } from './src/pages/InboxPage.jsx';
import { ProfilePage } from './src/pages/ProfilePage.jsx';
import { LoginPage } from './src/pages/LoginPage.jsx';
import { RegisterPage } from './src/pages/RegisterPage.jsx';
import { ForgotPasswordPage } from './src/pages/ForgotPasswordPage.jsx';
import { ChangePasswordPage } from './src/pages/ChangePasswordPage.jsx';
import { CollegeRegistrationPage } from './src/pages/CollegeRegistrationPage.jsx';
import { SponsorListingPage } from './src/pages/SponsorListingPage.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(loadUserProfile());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventListingPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/sponsors" element={<SponsorListingPage />} />
      <Route path="/register-college" element={<CollegeRegistrationPage />} />
      
      {/* Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      
      {/* Protected Routes */}
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
        path="/profile/:id"
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
            <div className="min-h-screen pt-20 pb-12">
              <p className="text-center text-gray-600">Settings page loaded successfully!</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center py-20">
                  <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-xl text-gray-600">
                    Dashboard page coming soon! 🚀
                  </p>
                </div>
              </div>
            </div>
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
    <Provider store={store}>
      <Router>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Router>
    </Provider>
  );
}