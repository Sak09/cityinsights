import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's broken asset references in Create React App
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const AQI_COLORS = {
  1: '#48bb78',
  2: '#ecc94b',
  3: '#ed8936',
  4: '#e53e3e',
  5: '#9b2c2c',
};

const getAQIColor = (aqi) => AQI_COLORS[aqi] || '#718096';

const createCityIcon = (city) => {
  const aqi   = city.latestAQI?.aqi;
  const color = getAQIColor(aqi);
  const temp  = city.latestWeather?.temperature != null
    ? Math.round(city.latestWeather.temperature) + '°'
    : '–';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;cursor:pointer;user-select:none">
        <div style="
          width:48px;height:48px;border-radius:50%;
          background:${color}22;
          border:3px solid ${color};
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          box-shadow:0 0 12px ${color}44,0 2px 8px rgba(0,0,0,0.5);
          transition:transform 0.15s;
        ">
          <span style="font-size:14px;font-weight:800;color:#fff;line-height:1;text-shadow:0 1px 3px rgba(0,0,0,0.8)">${temp}</span>
        </div>
        <div style="
          position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);
          white-space:nowrap;font-size:10px;font-weight:700;
          background:rgba(15,17,23,0.85);color:#e2e8f0;
          padding:2px 7px;border-radius:5px;
          border:1px solid #2d3748;
          letter-spacing:0.02em;
        ">${city.name}</div>
      </div>`,
    iconSize:    [48, 72],
    iconAnchor:  [24, 24],
    popupAnchor: [0, -28],
  });
};

export default function WorldMap({ cities, onCityClick }) {
  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={2}
      maxZoom={10}
      style={{ height: '100%', width: '100%' }}
      worldCopyJump
      zoomControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />

      {cities.map((city) => (
        <Marker
          key={city._id}
          position={[city.lat, city.lon]}
          icon={createCityIcon(city)}
          eventHandlers={{ click: () => onCityClick(city) }}
        >
          <Popup maxWidth={220}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>
                  {city.countryCode.toUpperCase().split('').map(c =>
                    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
                  ).join('')}
                </span>
                <div>
                  <strong style={{ fontSize: 14, color: '#e2e8f0' }}>{city.name}</strong>
                  <div style={{ fontSize: 11, color: '#718096' }}>{city.country}</div>
                </div>
              </div>

              {city.latestWeather && (
                <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: 10 }}>
                  <span style={{ color: '#718096' }}>🌡 Temp</span>
                  <span style={{ fontWeight: 600 }}>{Math.round(city.latestWeather.temperature)}°C</span>
                  <span style={{ color: '#718096' }}>💧 Humidity</span>
                  <span style={{ fontWeight: 600 }}>{city.latestWeather.humidity}%</span>
                  <span style={{ color: '#718096' }}>🌬 Wind</span>
                  <span style={{ fontWeight: 600 }}>{city.latestWeather.windSpeed?.toFixed(1)} m/s</span>
                  {city.latestAQI && (
                    <>
                      <span style={{ color: '#718096' }}>🏭 AQI</span>
                      <span style={{ fontWeight: 600, color: getAQIColor(city.latestAQI.aqi) }}>
                        {city.latestAQI.aqi} ({city.latestAQI.category})
                      </span>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={() => onCityClick(city)}
                style={{
                  width: '100%', padding: '7px 0',
                  background: '#2b6cb0', color: '#fff',
                  border: 'none', borderRadius: 7,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}
              >
                View Full Details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
