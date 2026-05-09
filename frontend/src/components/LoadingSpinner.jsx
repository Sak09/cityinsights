import React from 'react';

/**
 * LoadingSpinner — inline or full-overlay spinner.
 */
export default function LoadingSpinner({ size = 36, overlay = false }) {
  const spinner = (
    <div
      className="spinner"
      style={{ width: size, height: size, borderWidth: size > 30 ? 3 : 2 }}
      aria-label="Loading"
      role="status"
    />
  );

  if (!overlay) return spinner;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15, 17, 23, 0.8)',
      backdropFilter: 'blur(2px)',
      zIndex: 500,
    }}>
      {spinner}
      <p style={{ marginTop: 12, color: '#718096', fontSize: 13 }}>Loading city data…</p>
    </div>
  );
}
