import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventLocation } from "../../../Store/map_annotator.slice.js";

// Fix default marker icons for Leaflet in bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function SearchControl() {
  const map = useMap();
  useEffect(() => {
    const geocoder = L.Control.geocoder({ defaultMarkGeocode: false })
      .on("markgeocode", function (e) {
        const center = e.geocode.center;
        const bounds = e.geocode.bbox;
        if (bounds) {
          map.fitBounds(bounds);
        } else if (center) {
          map.setView(center, Math.max(map.getZoom(), 13));
        }
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);
  return null;
}

function FlyToOnLocation({ center }) {
  const map = useMap();
  const latLng = useMemo(() => center, [center]);
  useEffect(() => {
    if (latLng && typeof latLng.lat === "number" && typeof latLng.lng === "number") {
      map.setView([latLng.lat, latLng.lng], Math.max(map.getZoom(), 16), {
        animate: true,
      });
    }
  }, [latLng, map]);
  return null;
}

export default function LeafletMap({ eventId }) {
  const dispatch = useDispatch();
  const { eventLocation, loading, error } = useSelector((s) => s.mapAnnotator);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventLocation(eventId));
    }
  }, [dispatch, eventId]);

  const center = eventLocation?.coordinates || { lat: 20, lng: 0 };
  const annotations = Array.isArray(eventLocation?.mapAnnotations)
    ? eventLocation.mapAnnotations
    : [];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={eventLocation ? 16 : 2}
        style={{ height: "500px", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <ZoomControl position="bottomright" />
        <SearchControl />
        {eventLocation && <FlyToOnLocation center={center} />}

        {annotations.map((a, idx) => {
          const lat = a?.coordinates?.lat;
          const lng = a?.coordinates?.lng;
          if (typeof lat !== "number" || typeof lng !== "number") return null;
          return (
            <Marker key={`${lat}-${lng}-${idx}`} position={[lat, lng]}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.label || "Annotation"}</div>
                  {a.description && <div style={{ color: "#374151" }}>{a.description}</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
