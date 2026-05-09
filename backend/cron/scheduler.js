const cron = require('node-cron');
const City = require('../models/City.model');
const weatherService = require('../services/weatherService');
const currencyService = require('../services/currencyService');


const fetchAllCityData = async () => {
  const timestamp = new Date().toISOString();
  console.log(`\n[CRON] ▶ Starting data fetch at ${timestamp}`);

  try {
    const cities = await City.find().lean();
    if (!cities.length) {
      console.log('[CRON] No cities found. Run: npm run seed');
      return;
    }

    let success = 0, failed = 0;

    for (const city of cities) {
      try {
        await Promise.allSettled([
          weatherService.fetchWeatherForCity(city),
          weatherService.fetchAQIForCity(city),
          currencyService.fetchCurrencyForCity(city),
        ]).then((results) => {
          results.forEach((r, i) => {
            const labels = ['weather', 'aqi', 'currency'];
            if (r.status === 'rejected') {
              console.warn(`[CRON]   ⚠ ${city.name} ${labels[i]}: ${r.reason?.message}`);
            }
          });
        });

        console.log(`[CRON] ${city.name} (${city.country})`);
        success++;
      } catch (err) {
        console.error(`[CRON]  ${city.name}: ${err.message}`);
        failed++;
      }
      await new Promise((r) => setTimeout(r, 1200));
    }

    console.log(`[CRON] Done — ${success} ok, ${failed} failed\n`);
  } catch (err) {
    console.error('[CRON] Fatal error:', err.message);
  }
};


const start = () => {
  
  fetchAllCityData();

  cron.schedule('*/30 * * * *', fetchAllCityData, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('[CRON] Scheduled: runs every 30 minutes (UTC)');
};

module.exports = { start, fetchAllCityData };
