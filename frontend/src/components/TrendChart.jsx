import React from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

const fmt = (d) => {
  try { return format(new Date(d), 'MM/dd HH:mm'); }
  catch { return String(d); }
};

const fmtShort = (d) => {
  try { return format(new Date(d), 'MM/dd'); }
  catch { return String(d); }
};

const tooltipStyle = {
  contentStyle: {
    background: '#1e2535',
    border: '1px solid #2d3748',
    borderRadius: 10,
    fontSize: 12,
    color: '#e2e8f0',
  },
  labelStyle: { color: '#a0aec0' },
  cursor: { stroke: '#4a5568', strokeWidth: 1 },
};

const NO_DATA = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: '#4a5568', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontSize: 32 }}>📭</span>
    <span style={{ fontSize: 13 }}>No historical data yet</span>
    <span style={{ fontSize: 11, color: '#2d3748' }}>Data accumulates over time via the cron scheduler</span>
  </div>
);

/**
 * TrendChart — renders temperature, humidity, AQI, or currency trend lines.
 */
export default function TrendChart({ type, weatherData, aqiData, currencyData, currency }) {

  if (type === 'temperature') {
    if (!weatherData?.length) return NO_DATA;
    const data = weatherData.map((d) => ({
      time: fmtShort(d.fetchedAt),
      fullTime: fmt(d.fetchedAt),
      Temp: Math.round(d.temperature),
      'Feels Like': Math.round(d.feelsLike),
    }));

    return (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ed8936" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ed8936" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4a5568' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} unit="°" width={36} />
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}°C`]} labelFormatter={(l, p) => p[0]?.payload?.fullTime || l} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#a0aec0' }} />
          <Area type="monotone" dataKey="Temp" stroke="#ed8936" strokeWidth={2} fill="url(#tempGrad)" dot={false} />
          <Line type="monotone" dataKey="Feels Like" stroke="#fc8181" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'humidity') {
    if (!weatherData?.length) return NO_DATA;
    const data = weatherData.map((d) => ({
      time: fmtShort(d.fetchedAt),
      fullTime: fmt(d.fetchedAt),
      Humidity: d.humidity,
      Pressure: d.pressure,
    }));

    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4a5568' }} interval="preserveStartEnd" />
          <YAxis yAxisId="h" tick={{ fontSize: 10, fill: '#4a5568' }} unit="%" width={36} />
          <YAxis yAxisId="p" orientation="right" tick={{ fontSize: 10, fill: '#4a5568' }} unit="hPa" width={46} />
          <Tooltip {...tooltipStyle} labelFormatter={(l, p) => p[0]?.payload?.fullTime || l} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#a0aec0' }} />
          <Line yAxisId="h" type="monotone" dataKey="Humidity" stroke="#63b3ed" strokeWidth={2} dot={false} />
          <Line yAxisId="p" type="monotone" dataKey="Pressure" stroke="#9f7aea" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'aqi') {
    if (!aqiData?.length) return NO_DATA;
    const data = aqiData.map((d) => ({
      time: fmtShort(d.fetchedAt),
      fullTime: fmt(d.fetchedAt),
      AQI: d.aqi,
      'PM2.5': parseFloat(d.pm25?.toFixed(1)) || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ed8936" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ed8936" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4a5568' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} domain={[1, 5]} ticks={[1,2,3,4,5]} width={28} />
          <ReferenceLine y={3} stroke="#ed8936" strokeDasharray="4 2" label={{ value: 'Moderate', position: 'insideRight', fontSize: 9, fill: '#ed8936' }} />
          <Tooltip {...tooltipStyle} formatter={(v, n) => [n === 'AQI' ? v : `${v} µg/m³`, n]} labelFormatter={(l, p) => p[0]?.payload?.fullTime || l} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#a0aec0' }} />
          <Area type="monotone" dataKey="AQI" stroke="#ed8936" strokeWidth={2} fill="url(#aqiGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'currency') {
    if (!currencyData?.length) return NO_DATA;
    const data = currencyData.map((d) => ({
      time: fmtShort(d.fetchedAt),
      fullTime: fmt(d.fetchedAt),
      [`${d.baseCurrency}/INR`]: parseFloat(d.rateToINR?.toFixed(2)) || 0,
    }));
    const key = Object.keys(data[0] || {}).find((k) => k !== 'time' && k !== 'fullTime') || 'Rate';

    return (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="curGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#68d391" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#68d391" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4a5568' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} width={50} />
          <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v}`, key]} labelFormatter={(l, p) => p[0]?.payload?.fullTime || l} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#a0aec0' }} />
          <Area type="monotone" dataKey={key} stroke="#68d391" strokeWidth={2} fill="url(#curGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
