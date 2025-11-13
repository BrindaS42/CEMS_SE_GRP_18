<<<<<<< HEAD
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
=======
import { useEffect, useRef, useMemo } from "react";
>>>>>>> authentication
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import { useDispatch, useSelector } from "react-redux";
import { saveEventLocation } from "../../../Store/map_annotator.slice.js";

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

 function MapControls({ eventId }) {
  const map = useMap();
  const dispatch = useDispatch();
<<<<<<< HEAD
  const navigate = useNavigate();
=======
>>>>>>> authentication
  const { saving, error } = useSelector((s) => s.mapAnnotator);
  const drawnItemsRef = useRef(null);
  const baseMarkerRef = useRef(null);
  const baseLatLngRef = useRef(null);

  useEffect(() => {
    // Group to store drawn markers/layers
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    // Basic HTML escaping to safely inject values into popup inputs
    const escapeHtml = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Attach editable popup to a marker for title/description and base selection
    const attachMarkerPopup = (marker) => {
      const getPopupHtml = () => {
        const current = marker._annotation || { title: "", description: "" };
        return (
          `<div class="p-1" style="min-width:220px;max-width:260px;">` +
          `<div class="mb-1"><label style="display:block;font-weight:600;margin-bottom:4px;">Title</label>` +
          `<input id="marker-title" type="text" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:4px;" value="${escapeHtml(current.title)}" /></div>` +
          `<div class="mb-1"><label style="display:block;font-weight:600;margin-bottom:4px;">Description</label>` +
          `<textarea id="marker-desc" rows="3" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:4px;">${escapeHtml(current.description)}</textarea></div>` +
          `<div style="display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:6px;">` +
          `<button id="set-base" style="padding:4px 8px;background:#10b981;color:white;border:none;border-radius:4px;cursor:pointer;">Set as Location</button>` +
          `<div style="display:flex;gap:8px;">` +
          `<button id="save-ann" style="padding:4px 8px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Save</button>` +
          `<button id="delete-ann" style="padding:4px 8px;background:#dc2626;color:white;border:none;border-radius:4px;cursor:pointer;">Delete</button>` +
          `</div>` +
          `</div>` +
          `</div>`
        );
      };

      marker.bindPopup(getPopupHtml(), { closeOnClick: false });

      const onPopupOpen = () => {
        const container = marker.getPopup().getElement();
        if (!container) return;
        const titleInput = container.querySelector('#marker-title');
        const descInput = container.querySelector('#marker-desc');
        const saveBtn = container.querySelector('#save-ann');
        const deleteBtn = container.querySelector('#delete-ann');
        const setBaseBtn = container.querySelector('#set-base');

        if (titleInput && descInput) {
          const current = marker._annotation || { title: "", description: "" };
          titleInput.value = current.title || "";
          descInput.value = current.description || "";
        }

        if (saveBtn) {
          saveBtn.onclick = (e) => {
            e.preventDefault();
            const title = titleInput ? titleInput.value : "";
            const description = descInput ? descInput.value : "";
            marker._annotation = { title, description };
<<<<<<< HEAD
=======
            // Re-render the popup content to ensure values reflect saved state
>>>>>>> authentication
            marker.setPopupContent(getPopupHtml());
            marker.openPopup();
          };
        }

        if (deleteBtn) {
          deleteBtn.onclick = (e) => {
            e.preventDefault();
<<<<<<< HEAD
=======
            // If deleting the selected base, clear it
>>>>>>> authentication
            if (baseMarkerRef.current === marker) {
              baseMarkerRef.current = null;
              baseLatLngRef.current = null;
            }
            drawnItems.removeLayer(marker);
          };
        }

        if (setBaseBtn) {
          setBaseBtn.onclick = (e) => {
            e.preventDefault();
            const { lat, lng } = marker.getLatLng();
            baseMarkerRef.current = marker;
            baseLatLngRef.current = { lat, lng };
            marker.closePopup();
          };
        }
      };

      marker.on('popupopen', onPopupOpen);
      return marker;
    };

<<<<<<< HEAD
    // Draw control: only Marker add and deletion enabled via Edit toolbar
=======
    // Draw control: only Marker add, and deletion enabled via Edit toolbar
>>>>>>> authentication
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

<<<<<<< HEAD
    // When a new layer is created add it to the group
=======
    // When a new layer is created (e.g., Marker), add it to the group
>>>>>>> authentication
    const onCreated = (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      if (layer instanceof L.Marker) {
        attachMarkerPopup(layer).openPopup();
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
            m._annotation = { title: e.geocode.name, description: "" };
          }
          attachMarkerPopup(m).openPopup();
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

  const savePayload = useMemo(() => {
    return () => {
      const group = drawnItemsRef.current;
      if (!group) return null;
      const mapAnnotations = [];
      group.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          const { lat, lng } = layer.getLatLng();
          const ann = layer._annotation || { title: "", description: "" };
          mapAnnotations.push({
            label: ann.title || "",
            description: ann.description || "",
            coordinates: { lat, lng },
          });
        }
      });
      const base = baseLatLngRef.current || map.getCenter();
<<<<<<< HEAD
      let address = "";
      if (baseMarkerRef.current && baseMarkerRef.current._annotation) {
        address = baseMarkerRef.current._annotation.title || "";
      }
      const location = {
        address: address,
=======
      const location = {
        address: "",
>>>>>>> authentication
        coordinates: { lat: base.lat, lng: base.lng },
        mapAnnotations,
      };
      return location;
    };
  }, [map]);

<<<<<<< HEAD
  const onSave = useCallback(async () => {
=======
  const onSave = () => {
>>>>>>> authentication
    if (!eventId) {
      alert("Missing eventId for saving location");
      return;
    }
    const location = savePayload();
    if (!location) return;
<<<<<<< HEAD

    try {
      await dispatch(saveEventLocation({ eventId, location })).unwrap();
      alert("Location saved successfully!");
      navigate('/admin?tab=add-location');
    } catch (rejectedValue) {
      alert(`Failed to save location: ${rejectedValue}`);
    }
  }, [eventId, dispatch, navigate, savePayload]);
=======
    dispatch(saveEventLocation({ eventId, location }));
  };
>>>>>>> authentication

  // Save button overlay
  useEffect(() => {
    const container = L.DomUtil.create('div', 'leaflet-bottom leaflet-right');
    const buttonWrap = L.DomUtil.create('div', 'leaflet-control', container);
    buttonWrap.style.background = 'white';
    buttonWrap.style.padding = '6px';
    buttonWrap.style.borderRadius = '4px';
    const btn = L.DomUtil.create('button', '', buttonWrap);
    btn.textContent = saving ? 'Saving...' : 'Save';
    btn.style.padding = '6px 10px';
    btn.style.background = saving ? '#9ca3af' : '#2563eb';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';

    const onClick = (e) => {
      L.DomEvent.stopPropagation(e);
      onSave();
    };
    btn.addEventListener('click', onClick);

    const SaveControl = L.Control.extend({
      onAdd: function () {
        return container;
      },
    });
    const saveControl = new SaveControl({ position: 'bottomright' });
    map.addControl(saveControl);

    return () => {
      btn.removeEventListener('click', onClick);
      map.removeControl(saveControl);
    };
<<<<<<< HEAD
  }, [map, saving, onSave]);
=======
  }, [map, saving]);
>>>>>>> authentication

  return null;
}

<<<<<<< HEAD
export default function MapWindow() {
  const { eventId } = useParams();
=======
export default function MapWindow({ eventId }) {
>>>>>>> authentication
  return (
    <div className="h-screen w-full">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <MapControls eventId={eventId} />
      </MapContainer>
    </div>
  );
}
