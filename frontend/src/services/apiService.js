import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export const fetchAllCities = () =>
  api.get('/cities').then((r) => r.data.data);

export const fetchCityById = (id) =>
  api.get(`/cities/${id}`).then((r) => r.data.data);

export const fetchWeatherHistory = (id, days = 7) =>
  api.get(`/cities/${id}/weather`, { params: { days } }).then((r) => r.data.data);

export const fetchAQIHistory = (id, days = 7) =>
  api.get(`/cities/${id}/aqi`, { params: { days } }).then((r) => r.data.data);

export const fetchCurrencyHistory = (id, days = 7) =>
  api.get(`/cities/${id}/currency`, { params: { days } }).then((r) => r.data.data);

export const triggerRefresh = () =>
  api.get('/cities/refresh').then((r) => r.data);

export const checkHealth = () =>
  api.get('/health').then((r) => r.data);
