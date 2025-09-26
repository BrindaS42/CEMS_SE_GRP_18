import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrganizerProfile from "./Pages/organizer_profile.page.jsx";
import Dashboard from "./Pages/dashboard.page.jsx";
import Sidebar from "./components/general/sidebar.jsx"

const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">{children}</div>
    </div>
  );
};


function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Route for /profile */}
          <Route path="/profile" element={<AppLayout><OrganizerProfile /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="*" element={<div>hii i am Not Found</div>} />
        </Routes>
      </Router>
    </>

  );
}

export default App;
