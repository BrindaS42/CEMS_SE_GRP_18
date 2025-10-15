import React from "react";
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login.page.jsx';
import Home from './Pages/Home.page.jsx';
import OrganizerProfile from "./Pages/Organizer/Profile.page.jsx";
import Sidebar from "./Components/general/sidebar.jsx";
import Dashboard from './Pages/Organizer/Dashboard.page.jsx';
import AdminPage from './Pages/Organizer/Admin.page.jsx';
import EventForm from './Components/Organizers/EventForm.jsx';

function App() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  const AppLayout = ({ children }) => {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">{children}</div>
      </div>
    );
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={isAuthenticated ? <AppLayout><OrganizerProfile /></AppLayout> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={isAuthenticated ?  <AppLayout><Dashboard/></AppLayout> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={isAuthenticated ? <AppLayout><AdminPage/></AppLayout> : <Navigate to="/login" replace />} />
        <Route 
          path="/admin/events/:eventId" 
          element={isAuthenticated ? <AppLayout><EventForm /></AppLayout> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;