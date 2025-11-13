import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { Toaster } from './components/ui/toaster';
import { Navbar } from './components/general/Navbar.jsx';
import { HomePage } from './Pages/HomePage.jsx';
import { LoginPage } from './Pages/Authentication/LoginPage.jsx';
import { RegisterPage } from './Pages/Authentication/RegisterPage.jsx';
import { ForgotPasswordPage } from './Pages/Authentication/ForgotPasswordPage';
import ChangePasswordPage  from './Pages/Authentication/ChangePasswordPage.jsx';
import { CollegeRegistrationPage } from './Pages/Authentication/CollegeRegistrationPage.jsx';
// import { EventListingPage } from './Pages/EventListingPage.jsx';
// import { EventDetailsPage } from './Pages/EventDetailsPage.jsx';
// import { InboxPage } from './Pages/InboxPage.jsx';
// import { ProfilePage } from './Pages/ProfilePage.jsx';
// import { SponsorListingPage } from './Pages/SponsorListingPage.jsx';
// import OrganizerProfile from "./Pages/Organizer/Profile.page.jsx";
// import Sidebar from "./Components/general/sidebar.jsx";
// import Dashboard from './Pages/Organizer/Dashboard.page.jsx';
// import AdminPage from './Pages/Organizer/Admin.page.jsx';
// import EventForm from './Components/Organizers/EventForm.jsx';
// import MapWindow from './Components/EventComponents/Map/mapWindow.jsx';
import { fetchUserProfile } from './store/profile.slice.js';

// Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
//       </div>
//     );
//   }

//   return <>{children}</>;
// };

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

// Organizer Layout (existing)
// const OrganizerLayout = ({ children }) => {
//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />
//       <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">{children}</div>
//     </div>
//   );
// };

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(fetchUserProfile());
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
      
      {/* <Route
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
      /> */}

      {/* Organizer Routes - Existing UI with Sidebar */}
      {/* <Route path="/organizer/profile" element={isAuthenticated ? <OrganizerLayout><OrganizerProfile /></OrganizerLayout> : <Navigate to="/login" replace />} />
      <Route path="/organizer/dashboard" element={isAuthenticated ? <OrganizerLayout><Dashboard /></OrganizerLayout> : <Navigate to="/login" replace />} />
      <Route path="/admin" element={isAuthenticated ? <OrganizerLayout><AdminPage /></OrganizerLayout> : <Navigate to="/login" replace />} />
      <Route
        path="/admin/events/:eventId"
        element={isAuthenticated ? <OrganizerLayout><EventForm /></OrganizerLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/add-location/:eventId"
        element={isAuthenticated ? <OrganizerLayout><MapWindow /></OrganizerLayout> : <Navigate to="/login" replace />}
      /> */}

      {/* Dashboard Route */}
      {/* <Route
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
      /> */}

      {/* 404 */}
      {/* <Route
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
      /> */}
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