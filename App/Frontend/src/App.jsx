import React from "react";
import { useSelector } from 'react-redux';
import LoginPage from './Pages/Login.page.jsx';
import HomePage from './Pages/Home.page.jsx';
import LeafletMap from "./Components/EventComponents/Map/mapWindow.jsx";


function App() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <HomePage />
      <div className="mt-6">
        <h2 className="text-xl font-bold text-center p-4">Leaflet Map Demo</h2>
        <LeafletMap />
      </div>
    </div>
  );
}

export default App;
