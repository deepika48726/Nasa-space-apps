import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Custom glowing HTML div icon for space theme
const createPulsingIcon = (label) => {
  return L.divIcon({
    className: 'custom-pulsing-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; background: rgba(0, 229, 255, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 16px; height: 16px; background: #00e5ff; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px #00e5ff;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Map click listener hook component
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      onLocationSelect({ lat, lon });
    },
  });
  return null;
}

// Center updater hook component
function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapPicker({
  lat = 78.22,
  lon = 15.65,
  name = 'Selected Point',
  onLocationSelect,
  height = '240px',
}) {
  const center = [lat, lon];
  const icon = createPulsingIcon(name);

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg group">
      {/* Top Coordinate Badge */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-1.5 shadow-md">
        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        <span>
          {lat.toFixed(2)}°, {lon.toFixed(2)}°
        </span>
      </div>

      {/* Helper Click Callout */}
      <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-[11px] text-slate-300 pointer-events-none">
        👉 Click anywhere to reposition marker
      </div>

      <div style={{ height }}>
        <MapContainer
          center={center}
          zoom={3}
          minZoom={1}
          maxZoom={12}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          {/* CartoDB Positron styled tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={center} icon={icon}>
            <Popup className="text-slate-900 font-sans">
              <div className="text-xs">
                <strong>{name}</strong>
                <br />
                {lat.toFixed(4)}°, {lon.toFixed(4)}°
              </div>
            </Popup>
          </Marker>
          <ClickHandler onLocationSelect={onLocationSelect} />
          <MapCenterUpdater center={center} />
        </MapContainer>
      </div>
    </div>
  );
}
