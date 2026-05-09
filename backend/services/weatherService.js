const axios = require('axios');
const WeatherSnapshot = require('../models/WeatherSnapshot.model');
const AQISnapshot = require('../models/AQISnapshot.model');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

const AQI_CATEGORIES = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor',
};

// ─── Fetch & Store ────────────────────────────────────────────────────────────

const fetchWeatherForCity = async (city) => {
  const { data } = await axios.get(`${OWM_BASE}/weather`, {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric',
    },
    timeout: 10000,
  });

  const snapshot = await WeatherSnapshot.create({
    cityId:      city._id,
    temperature: data.main.temp,
    feelsLike:   data.main.feels_like,
    tempMin:     data.main.temp_min,
    tempMax:     data.main.temp_max,
    humidity:    data.main.humidity,
    pressure:    data.main.pressure,
    windSpeed:   data.wind?.speed,
    windDeg:     data.wind?.deg,
    windGust:    data.wind?.gust,
    visibility:  data.visibility,
    description: data.weather[0]?.description,
    icon:        data.weather[0]?.icon,
    clouds:      data.clouds?.all,
    sunrise:     data.sys?.sunrise,
    sunset:      data.sys?.sunset,
    fetchedAt:   new Date(),
  });

  return snapshot;
};

/**
 * Fetch air quality (AQI) from OpenWeatherMap Air Pollution API and save to DB.
 */
const fetchAQIForCity = async (city) => {
  const { data } = await axios.get(`${OWM_BASE}/air_pollution`, {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: process.env.OPENWEATHER_API_KEY,
    },
    timeout: 10000,
  });

  const item = data.list[0];
  const comp = item.components;
  const aqiVal = item.main.aqi;

  const snapshot = await AQISnapshot.create({
    cityId:    city._id,
    aqi:       aqiVal,
    category:  AQI_CATEGORIES[aqiVal] || 'Unknown',
    pm25:      comp.pm2_5,
    pm10:      comp.pm10,
    co:        comp.co,
    no:        comp.no,
    no2:       comp.no2,
    o3:        comp.o3,
    so2:       comp.so2,
    nh3:       comp.nh3,
    fetchedAt: new Date(),
  });

  return snapshot;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

const getLatestWeather = (cityId) =>
  WeatherSnapshot.findOne({ cityId }).sort({ fetchedAt: -1 }).lean();

const getLatestAQI = (cityId) =>
  AQISnapshot.findOne({ cityId }).sort({ fetchedAt: -1 }).lean();

const getWeatherHistory = (cityId, days = 7) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return WeatherSnapshot.find({ cityId, fetchedAt: { $gte: since } })
    .sort({ fetchedAt: 1 })
    .select('temperature feelsLike humidity pressure windSpeed clouds fetchedAt')
    .lean();
};

const getAQIHistory = (cityId, days = 7) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return AQISnapshot.find({ cityId, fetchedAt: { $gte: since } })
    .sort({ fetchedAt: 1 })
    .select('aqi category pm25 pm10 o3 no2 fetchedAt')
    .lean();
};

module.exports = {
  fetchWeatherForCity,
  fetchAQIForCity,
  getLatestWeather,
  getLatestAQI,
  getWeatherHistory,
  getAQIHistory,
};
