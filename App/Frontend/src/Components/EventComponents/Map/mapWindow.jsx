import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

// Fix marker icons in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapControls() {
  const map = useMap();

  useEffect(() => {
    // Group to store drawn markers/layers
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Draw control: only Marker add, and deletion enabled via Edit toolbar
    const drawControl = new L.Control.Draw({
      draw: {
        marker: true,
        polygon: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    // When a new layer is created (e.g., Marker), add it to the group
    const onCreated = (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      if (layer instanceof L.Marker) {
        layer.bindPopup("Marker");
      }
    };

    map.on(L.Draw.Event.CREATED, onCreated);

    // Geocoder control: place marker on result and zoom to bounds
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        const center = e.geocode.center;
        const bounds = e.geocode.bbox;
        if (bounds) {
          map.fitBounds(bounds);
        } else if (center) {
          map.setView(center, 13);
        }
        if (center) {
          const m = L.marker(center).addTo(drawnItems);
          if (e.geocode && e.geocode.name) {
            m.bindPopup(e.geocode.name).openPopup();
          }
        }
      })
      .addTo(map);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeControl(drawControl);
      map.removeControl(geocoder);
      map.removeLayer(drawnItems);
    };
  }, [map]);

  return null;
}

export default function LeafletMap() {
  return (
    <div className="h-screen w-full">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <MapControls />
      </MapContainer>
    </div>
  );
}
