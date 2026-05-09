import React, { useEffect, useState, useCallback } from 'react';
import TempGauge from './TempGauge';
import AQIIndicator from './AQIIndicator';
import CurrencyCard from './CurrencyCard';
import TrendChart from './TrendChart';
import LoadingSpinner from './LoadingSpinner';
import { fetchWeatherHistory, fetchAQIHistory, fetchCurrencyHistory } from '../services/apiService';

export default function CityModal({ city, onClose }) {
  const [days, setDays]                   = useState(7);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [aqiHistory, setAqiHistory]         = useState([]);
  const [currencyHistory, setCurrencyHistory] = useState([]);
  const [histLoading, setHistLoading]       = useState(true);
  const [activeChart, setActiveChart]       = useState('temperature');

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const [wh, ah, ch] = await Promise.all([
        fetchWeatherHistory(city._id, days),
        fetchAQIHistory(city._id, days),
        fetchCurrencyHistory(city._id, days),
      ]);
      setWeatherHistory(wh);
      setAqiHistory(ah);
      setCurrencyHistory(ch);
    } catch (err) {
      console.error('History load error:', err.message);
    } finally {
      setHistLoading(false);
    }
  }, [city._id, days]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const w = city.latestWeather;
  const a = city.latestAQI;
  const c = city.latestCurrency;

  const flag = city.countryCode?.toUpperCase().split('').map(ch =>
    String.fromCodePoint(0x1F1E6 - 65 + ch.charCodeAt(0))
  ).join('') || '';

  const lastUpdated = w?.fetchedAt
    ? new Date(w.fetchedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  const dataRows = w ? [
    ['🌡', 'Temperature',    `${Math.round(w.temperature)}°C`],
    ['🤔', 'Feels Like',     `${Math.round(w.feelsLike)}°C`],
    ['🌡', 'Min / Max',      `${Math.round(w.tempMin || w.temperature)}°C / ${Math.round(w.tempMax || w.temperature)}°C`],
    ['💧', 'Humidity',       `${w.humidity}%`],
    ['📊', 'Pressure',       `${w.pressure} hPa`],
    ['🌬', 'Wind Speed',     `${w.windSpeed?.toFixed(1)} m/s`],
    ['👁', 'Visibility',     `${((w.visibility || 0) / 1000).toFixed(1)} km`],
    ['☁', 'Cloud Cover',    `${w.clouds}%`],
    ['🌤', 'Conditions',    w.description ? w.description.charAt(0).toUpperCase() + w.description.slice(1) : '—'],
    a ? ['🏭', 'AQI Index',  `${a.aqi} — ${a.category}`] : null,
    a ? ['💨', 'PM2.5',      `${a.pm25?.toFixed(1) || '—'} µg/m³`] : null,
    a ? ['💨', 'PM10',       `${a.pm10?.toFixed(1) || '—'} µg/m³`] : null,
    c ? ['💰', `1 ${c.baseCurrency} → INR`, `₹${c.rateToINR?.toFixed(2) || '—'}`] : null,
    c ? ['💵', `1 ${c.baseCurrency} → USD`, `$${c.rateToUSD?.toFixed(4) || '—'}`] : null,
  ].filter(Boolean) : [];

  const chartTabs = [
    { key: 'temperature', label: '🌡 Temp' },
    { key: 'humidity',    label: '💧 Humidity' },
    { key: 'aqi',         label: '🏭 AQI' },
    { key: 'currency',    label: '💱 Currency' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 36 }}>{flag}</span>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>{city.name}</h2>
              <p style={{ color: '#718096', fontSize: 13 }}>
                {city.country} · {city.timezone}
                {city.population && ` · Pop: ${(city.population / 1e6).toFixed(1)}M`}
              </p>
              <p style={{ color: '#4a5568', fontSize: 11, marginTop: 2 }}>
                Updated: {lastUpdated}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#1e2535', border: '1px solid #2d3748',
              color: '#a0aec0', fontSize: 18, width: 34, height: 34,
              borderRadius: 8, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* ── Gauges Row ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }} className="modal-grid-3">
          <TempGauge temperature={w?.temperature} feelsLike={w?.feelsLike} />
          <AQIIndicator aqi={a?.aqi} category={a?.category} pm25={a?.pm25} />
          <CurrencyCard currency={city.currency} rateToINR={c?.rateToINR} rateToUSD={c?.rateToUSD} />
        </div>

        {/* ── Data Table ───────────────────────────────────────── */}
        {dataRows.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a0aec0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              Current Conditions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }} className="modal-grid-2">
              {dataRows.map(([icon, label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0', borderBottom: '1px solid #1a1f2e',
                }}>
                  <span style={{ fontSize: 12, color: '#718096' }}>{icon} {label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trend Charts ─────────────────────────────────────── */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a0aec0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Historical Trends
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {chartTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveChart(key)}
                  style={{
                    padding: '4px 11px', fontSize: 11, borderRadius: 6,
                    cursor: 'pointer', border: 'none', fontWeight: 500,
                    background: activeChart === key ? '#2b6cb0' : '#2d3748',
                    color: activeChart === key ? '#fff' : '#a0aec0',
                    transition: 'all 0.15s',
                  }}
                >{label}</button>
              ))}
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{
                  background: '#2d3748', color: '#e2e8f0',
                  border: '1px solid #4a5568', borderRadius: 6,
                  padding: '4px 8px', fontSize: 11, cursor: 'pointer',
                }}
              >
                <option value={7}>7 days</option>
                <option value={10}>10 days</option>
                <option value={15}>15 days</option>
              </select>
            </div>
          </div>

          {histLoading
            ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><LoadingSpinner /></div>
            : (
              <TrendChart
                type={activeChart}
                weatherData={weatherHistory}
                aqiData={aqiHistory}
                currencyData={currencyHistory}
                currency={city.currency}
              />
            )
          }
        </div>

      </div>
    </div>
  );
}
