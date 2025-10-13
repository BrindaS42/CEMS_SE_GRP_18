// src/App.jsx

import React, { useEffect, Component } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { store } from './store/store';
import { setCurrentPage } from './store/slices/uiSlice';

// Main App Components
import { Header } from './components/Header';
import { CustomSidebar } from './components/CustomSidebar';
import { CollapsibleActionPanel } from './components/CollapsibleActionPanel';
import { Toaster } from './components/ui/sonner';

// Your existing pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTeam from './pages/CreateTeam';
import EventForm from './pages/EventForm';
import ProfileSimple from './pages/ProfileSimple';
import Inbox from './pages/Inbox';
import Settings from './pages/Settings';

// --- NEWLY ADDED from the second file ---
import Home from './Pages/Home.page.jsx';
import OrganizerProfile from "./Pages/organizer_profile.page.jsx";
// --- END NEWLY ADDED ---


// Error Boundary Component (from your main file)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-college-blue/10 to-college-yellow/10 dark:from-slate-950 dark:to-slate-900">
          <div className="text-center p-8">
            <h1 className="text-2xl font-semibold text-college-blue dark:text-white mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">Please try reloading the page</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-college-blue text-white rounded-lg hover:bg-college-blue/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

// Main Layout component for authenticated routes (from your main file)
function Layout({ children }) {
  const { sidebarOpen, rightPanelOpen, sidebarHovered, darkMode } = useSelector((state) => state.ui);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen w-full relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="flex-1">
        <Header />
        <CustomSidebar />
        <div className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'ml-[20%]' : 'ml-0'
        } ${
          rightPanelOpen ? 'mr-[25%]' : 'mr-0'
        } min-h-[calc(100vh-4rem)] relative`}>
          {children}
        </div>
        <CollapsibleActionPanel />
        {sidebarHovered && !sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 pointer-events-none transition-opacity duration-300" />
        )}
      </div>
    </div>
  );
}
Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

// Protected Route component (from your main file)
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Fallback component for unmatched routes
function NotFound() {
  // ... (code for NotFound remains the same)
}

// Wrapper component to set page title
function AdminDashboard() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setCurrentPage('Admin Dashboard'));
  }, [dispatch]);
  return <Dashboard />;
}

// The main App Router component with all routes combined
function AppRouter() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* --- NEWLY ADDED: Public home page from the second file --- */}
        <Route path="/" element={<Home />} />
        
        {/* Login Route */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        {/* Your Existing Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileSimple /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/create-team" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
        <Route path="/event-form" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />

        {/* --- NEWLY ADDED: Organizer Profile at a new URL to avoid conflict --- */}
        <Route path="/organizer-profile" element={<ProtectedRoute><OrganizerProfile /></ProtectedRoute>} />
        
        {/* Catch-all routes */}
        <Route path="/preview_page.html" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// Main App component
export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppRouter />
        <Toaster position="top-right" />
      </ErrorBoundary>
    </Provider>
  );
}