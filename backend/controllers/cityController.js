const City = require('../models/City.model');
const weatherService = require('../services/weatherService');
const currencyService = require('../services/currencyService');

/**
 * GET /api/cities
 * Returns all 10 cities with their latest weather, AQI, and currency snapshots.
 */
const getAllCities = async (req, res, next) => {
  try {
    const cities = await City.find().lean();

    const enriched = await Promise.all(
      cities.map(async (city) => {
        const [weather, aqi, currency] = await Promise.all([
          weatherService.getLatestWeather(city._id),
          weatherService.getLatestAQI(city._id),
          currencyService.getLatestCurrency(city._id),
        ]);
        return {
          ...city,
          latestWeather:  weather  || null,
          latestAQI:      aqi      || null,
          latestCurrency: currency || null,
        };
      })
    );

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cities/:id
 * Returns a single city with full latest snapshot data.
 */
const getCityById = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id).lean();
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }

    const [weather, aqi, currency] = await Promise.all([
      weatherService.getLatestWeather(city._id),
      weatherService.getLatestAQI(city._id),
      currencyService.getLatestCurrency(city._id),
    ]);

    res.json({
      success: true,
      data: {
        ...city,
        latestWeather:  weather  || null,
        latestAQI:      aqi      || null,
        latestCurrency: currency || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cities/:id/weather?days=7
 * Returns weather history for a city (up to 15 days).
 */
const getCityWeatherHistory = async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 15);
    const history = await weatherService.getWeatherHistory(req.params.id, days);
    res.json({ success: true, days, count: history.length, data: history });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cities/:id/aqi?days=7
 * Returns AQI history for a city.
 */
const getCityAQIHistory = async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 15);
    const history = await weatherService.getAQIHistory(req.params.id, days);
    res.json({ success: true, days, count: history.length, data: history });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cities/:id/currency?days=7
 * Returns currency history for a city.
 */
const getCityCurrencyHistory = async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 15);
    const history = await currencyService.getCurrencyHistory(req.params.id, days);
    res.json({ success: true, days, count: history.length, data: history });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCities,
  getCityById,
  getCityWeatherHistory,
  getCityAQIHistory,
  getCityCurrencyHistory,
};
