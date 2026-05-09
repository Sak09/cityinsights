import React from 'react';

/**
 * TempGauge — SVG arc gauge showing temperature.
 * Maps -20°C → 50°C to the arc.
 */
export default function TempGauge({ temperature, feelsLike }) {
  const temp = temperature ?? null;

  const pct = temp != null
    ? Math.min(100, Math.max(0, ((temp + 20) / 70) * 100))
    : 0;

  const color =
    temp == null  ? '#718096' :
    temp < 0      ? '#63b3ed' :
    temp < 10     ? '#76e4f7' :
    temp < 20     ? '#68d391' :
    temp < 30     ? '#f6e05e' :
    temp < 40     ? '#ed8936' : '#fc8181';

  // SVG arc: sweep from 225° to 315° total = 270° arc
  const r = 34;
  const cx = 50, cy = 54;
  const startAngle = 225;
  const totalArc   = 270;
  const endAngle   = startAngle + (pct / 100) * totalArc;

  const toRad = (a) => (a * Math.PI) / 180;
  const arc = (angle) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });

  const s = arc(startAngle);
  const e = arc(endAngle - 0.01);
  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
  const bgE = arc(startAngle + totalArc - 0.01);

  return (
    <div className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
      <svg viewBox="0 0 100 80" style={{ width: '100%', maxWidth: 130, margin: '0 auto', display: 'block' }}>
        {/* Background track */}
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${bgE.x} ${bgE.y}`}
          fill="none" stroke="#2d3748" strokeWidth="9" strokeLinecap="round"
        />
        {/* Colored fill */}
        {pct > 0 && (
          <path
            d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`}
            fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        )}
        {/* Center text */}
        <text x="50" y="52" textAnchor="middle" fill={color} fontSize="20" fontWeight="800">
          {temp != null ? `${Math.round(temp)}°` : '–'}
        </text>
        <text x="50" y="66" textAnchor="middle" fill="#718096" fontSize="8" fontWeight="500">
          TEMPERATURE
        </text>
      </svg>

      {feelsLike != null && (
        <p style={{ fontSize: 11, color: '#718096', marginTop: 6 }}>
          Feels like <span style={{ color: '#a0aec0', fontWeight: 600 }}>{Math.round(feelsLike)}°C</span>
        </p>
      )}
    </div>
  );
}
