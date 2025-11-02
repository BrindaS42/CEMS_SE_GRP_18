import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login.page.jsx';
import Home from './Pages/Home.page.jsx';
import OrganizerProfile from "./Pages/Organizer/Profile.page.jsx";
import Sidebar from "./Components/general/sidebar.jsx";
import Dashboard from './Pages/Organizer/Dashboard.page.jsx';
import AdminPage from './Pages/Organizer/Admin.page.jsx';
import EventForm from './Components/Organizers/EventForm.jsx';
import MapWindow from './Components/EventComponents/Map/mapWindow.jsx';
import { socket } from './socket.js'; 
import { setSocketConnected, setSocketDisconnected } from './Store/socket.slice.js';
import { addMessage } from './Store/event.interaction.slice.js';

function App() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    
    if (isAuthenticated) {
      socket.connect();

      function onConnect() {
        dispatch(setSocketConnected());
      }

      function onDisconnect() {
        dispatch(setSocketDisconnected());
      }

      function onReceiveMessage(newMessage) {
        console.log('Received message:', newMessage);
        dispatch(addMessage(newMessage));
      }

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('receive_message', onReceiveMessage);

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('receive_message', onReceiveMessage);
        socket.disconnect();
      };
    } else {
      socket.disconnect();
    }
  }, [isAuthenticated, dispatch]);

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
        <Route path="/dashboard" element={isAuthenticated ? <AppLayout><Dashboard /></AppLayout> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={isAuthenticated ? <AppLayout><AdminPage /></AppLayout> : <Navigate to="/login" replace />} />
        <Route
          path="/admin/events/:eventId"
          element={isAuthenticated ? <AppLayout><EventForm /></AppLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/add-location/:eventId"
          element={isAuthenticated ? <AppLayout><MapWindow /></AppLayout> : <Navigate to="/login" replace />}
        />

      </Routes>
    </div>
  );
}

export default App;