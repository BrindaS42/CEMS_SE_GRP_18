import React from "react";
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/Login.page.jsx';
import HomePage from './Pages/Home.page.jsx';
import DashboardPage from './Pages/Dashboard.page.jsx';


function App() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
        <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
