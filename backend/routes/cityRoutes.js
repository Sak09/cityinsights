const express = require('express');
const router = express.Router();

const cityController  = require('../controllers/cityController');
const weatherController = require('../controllers/weatherController');

// ─── Collection Routes ────────────────────────────────────────────────────────
// GET /api/cities              → All cities with latest snapshots
router.get('/', cityController.getAllCities);

// GET /api/cities/refresh      → Manually trigger data refresh (must be before :id)
router.get('/refresh', weatherController.refreshAllCities);

// ─── Single City Routes ───────────────────────────────────────────────────────
// GET /api/cities/:id                  → City + latest data
router.get('/:id', cityController.getCityById);

// GET /api/cities/:id/weather?days=7   → Weather history
router.get('/:id/weather', cityController.getCityWeatherHistory);

// GET /api/cities/:id/aqi?days=7       → AQI history
router.get('/:id/aqi', cityController.getCityAQIHistory);

// GET /api/cities/:id/currency?days=7  → Currency history
router.get('/:id/currency', cityController.getCityCurrencyHistory);

module.exports = router;
