import React from "react";
import LeafletMap from "./Components/EventComponents/Map/leafletMap.jsx";
import MapWindow from "./Components/EventComponents/Map/mapWindow.jsx";


function App() {
  return (
    <div className="App">
      <h1 className="text-xl font-bold text-center p-4">Leaflet Map Demo</h1>
      <LeafletMap eventId="66f3c1e2a4b8f2c9d0e1f234" />
    </div>
  );
}

export default App;
