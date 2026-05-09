import React, { useState, useCallback } from 'react';
import WorldMap from '../components/WorldMap';
import CityModal from '../components/CityModal';
import LoadingSpinner from '../components/LoadingSpinner';
import usePolling from '../hooks/usePolling';
import { fetchAllCities, triggerRefresh } from '../services/apiService';
import toast from 'react-hot-toast';

const POLL_INTERVAL = 30_000; // 30 seconds

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [refreshing, setRefreshing]     = useState(false);

  const { data: cities, loading, error, lastUpdated, refetch } = usePolling(
    fetchAllCities,
    POLL_INTERVAL
  );

  const handleCityClick  = useCallback((city) => setSelectedCity(city), []);
  const handleCloseModal = useCallback(() => setSelectedCity(null), []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing all city data...');
    try {
      await triggerRefresh();
      await refetch();
      toast.success('All city data refreshed!', { id: toastId });
    } catch (err) {
      toast.error(`Refresh failed: ${err.message}`, { id: toastId });
    } finally {
      setRefreshing(false);
    }
  };

  const cityCount = cities?.length || 0;
  const avgTemp   = cities
    ? (cities.reduce((s, c) => s + (c.latestWeather?.temperature ?? 0), 0) / cityCount).toFixed(1)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{
        padding: '10px 20px',
        background: '#13171f',
        borderBottom: '1px solid #1e2535',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🌍</span>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
              Global City Insights
            </h1>
            <p style={{ fontSize: 11, color: '#4a5568', marginTop: 1 }}>
              Real-time weather · AQI · currency for 10 global cities
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {cities && (
            <>
              <StatPill label="Cities" value={cityCount} color="#3182ce" />
              {avgTemp && <StatPill label="Avg Temp" value={`${avgTemp}°C`} color="#ed8936" />}
            </>
          )}
          <div style={{ fontSize: 11, color: '#4a5568', textAlign: 'right' }}>
            {lastUpdated
              ? <>Last updated<br /><span style={{ color: '#718096' }}>{lastUpdated.toLocaleTimeString()}</span></>
              : <span style={{ color: '#4a5568' }}>Fetching…</span>
            }
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              style={{
                padding: '7px 14px',
                background: refreshing ? '#1e2535' : '#2b6cb0',
                color: refreshing ? '#718096' : '#fff',
                border: '1px solid ' + (refreshing ? '#2d3748' : '#3182ce'),
                borderRadius: 8,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {refreshing ? '⏳ Refreshing…' : '🔄 Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Map area ───────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading && !cities && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0f1117', zIndex: 100,
          }}>
            <LoadingSpinner size={48} />
            <p style={{ marginTop: 16, color: '#718096', fontSize: 14 }}>
              Loading city data…
            </p>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            background: '#742a2a', color: '#fed7d7', padding: '10px 20px',
            borderRadius: 10, zIndex: 999, fontSize: 13, border: '1px solid #e53e3e',
            maxWidth: '90vw', textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        {cities && (
          <WorldMap cities={cities} onCityClick={handleCityClick} />
        )}

        {/* Live indicator */}
        <div style={{
          position: 'absolute', bottom: 24, left: 16, zIndex: 500,
          background: 'rgba(26,31,46,0.9)', border: '1px solid #2d3748',
          borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#718096',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            display: 'inline-block', width: 7, height: 7,
            background: '#48bb78', borderRadius: '50%',
            boxShadow: '0 0 6px #48bb78',
            animation: 'pulse 2s infinite',
          }} />
          Polls every 30s
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 24, right: 16, zIndex: 500,
          background: 'rgba(26,31,46,0.9)', border: '1px solid #2d3748',
          borderRadius: 8, padding: '8px 12px', fontSize: 11,
        }}>
          <div style={{ color: '#a0aec0', marginBottom: 4, fontWeight: 600 }}>AQI Legend</div>
          {[
            ['#48bb78', '1 — Good'],
            ['#ecc94b', '2 — Fair'],
            ['#ed8936', '3 — Moderate'],
            ['#e53e3e', '4 — Poor'],
            ['#9b2c2c', '5 — Very Poor'],
          ].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span style={{ color: '#a0aec0' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── City Modal ────────────────────────────────────────── */}
      {selectedCity && (
        <CityModal city={selectedCity} onClose={handleCloseModal} />
      )}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#4a5568' }}>{label}</div>
    </div>
  );
}
