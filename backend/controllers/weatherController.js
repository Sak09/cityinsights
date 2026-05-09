const City = require('../models/City.model');
const weatherService = require('../services/weatherService');
const currencyService = require('../services/currencyService');

/**
 * GET /api/cities/refresh
 * Manually triggers a full data refresh for all cities.
 * Rate-limited by the global rate limiter.
 */
const refreshAllCities = async (req, res, next) => {
  try {
    const cities = await City.find().lean();
    const results = [];
    const startTime = Date.now();

    for (const city of cities) {
      const cityResult = { city: city.name, status: 'ok', errors: [] };
      try {
        await weatherService.fetchWeatherForCity(city);
      } catch (err) {
        cityResult.errors.push(`weather: ${err.message}`);
      }

      try {
        await weatherService.fetchAQIForCity(city);
      } catch (err) {
        cityResult.errors.push(`aqi: ${err.message}`);
      }

      try {
        await currencyService.fetchCurrencyForCity(city);
      } catch (err) {
        cityResult.errors.push(`currency: ${err.message}`);
      }

      if (cityResult.errors.length > 0) cityResult.status = 'partial';
      results.push(cityResult);

      // Throttle to avoid rate limits (1 city/sec)
      await new Promise((r) => setTimeout(r, 1000));
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    res.json({
      success: true,
      refreshedAt: new Date().toISOString(),
      durationSeconds: elapsed,
      results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { refreshAllCities };
