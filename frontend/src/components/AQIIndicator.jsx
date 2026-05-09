import React from 'react';

const AQI_CONFIG = {
  1: { color: '#48bb78', bg: '#1a3a26', label: 'Good',      desc: 'Air quality is satisfactory' },
  2: { color: '#ecc94b', bg: '#3a3010', label: 'Fair',      desc: 'Acceptable air quality' },
  3: { color: '#ed8936', bg: '#3a2010', label: 'Moderate',  desc: 'Moderate health concern' },
  4: { color: '#e53e3e', bg: '#3a1010', label: 'Poor',      desc: 'Health effects possible' },
  5: { color: '#9b2c2c', bg: '#2a0a0a', label: 'Very Poor', desc: 'Health alert in effect' },
};

/**
 * AQIIndicator — circular indicator with AQI number and category.
 */
export default function AQIIndicator({ aqi, category, pm25 }) {
  const cfg = AQI_CONFIG[aqi] || { color: '#718096', bg: '#1e2535', label: 'N/A', desc: 'No data' };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
      {/* Outer glow ring */}
      <div style={{
        width: 76, height: 76,
        borderRadius: '50%',
        background: cfg.bg,
        border: `3px solid ${cfg.color}`,
        boxShadow: `0 0 16px ${cfg.color}44`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px',
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
          {aqi || '–'}
        </span>
        <span style={{ fontSize: 9, color: cfg.color, marginTop: 1, fontWeight: 600 }}>AQI</span>
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{category || cfg.label}</p>
      <p style={{ fontSize: 10, color: '#4a5568', marginTop: 3 }}>{cfg.desc}</p>

      {pm25 != null && (
        <p style={{ fontSize: 11, color: '#718096', marginTop: 6 }}>
          PM2.5: <span style={{ color: '#a0aec0', fontWeight: 600 }}>{pm25.toFixed(1)} µg/m³</span>
        </p>
      )}
    </div>
  );
}
