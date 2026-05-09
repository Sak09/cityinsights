const axios = require('axios');
const CurrencySnapshot = require('../models/CurrencySnapshot.model');

const EXCHANGE_BASE = 'https://v6.exchangerate-api.com/v6';

/**
 * Fetch currency exchange rates and save to DB.
 * Uses ExchangeRate-API v6 (free tier: 1500 req/month).
 */
const fetchCurrencyForCity = async (city) => {
  const apiKey = process.env.EXCHANGE_API_KEY;
  const currency = city.currency;

  let ratesData;

  try {
    // Try v6 (requires API key)
    const { data } = await axios.get(
      `${EXCHANGE_BASE}/${apiKey}/latest/${currency}`,
      { timeout: 10000 }
    );
    ratesData = data.conversion_rates;
  } catch {
    // Fallback: v4 free endpoint (no key, limited)
    const { data } = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${currency}`,
      { timeout: 10000 }
    );
    ratesData = data.rates;
  }

  // Build rates map (store only major currencies to keep doc small)
  const majorCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AED', 'AUD', 'CNY', 'BRL', 'EGP'];
  const ratesMap = {};
  majorCurrencies.forEach((cur) => {
    if (ratesData[cur] !== undefined) ratesMap[cur] = ratesData[cur];
  });

  const snapshot = await CurrencySnapshot.create({
    cityId:       city._id,
    baseCurrency: currency,
    rateToINR:    ratesData['INR'] || null,
    rateToUSD:    ratesData['USD'] || null,
    rateToEUR:    ratesData['EUR'] || null,
    rateToGBP:    ratesData['GBP'] || null,
    rates:        ratesMap,
    fetchedAt:    new Date(),
  });

  return snapshot;
};

const getLatestCurrency = (cityId) =>
  CurrencySnapshot.findOne({ cityId }).sort({ fetchedAt: -1 }).lean();

const getCurrencyHistory = (cityId, days = 7) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return CurrencySnapshot.find({ cityId, fetchedAt: { $gte: since } })
    .sort({ fetchedAt: 1 })
    .select('baseCurrency rateToINR rateToUSD fetchedAt')
    .lean();
};

module.exports = { fetchCurrencyForCity, getLatestCurrency, getCurrencyHistory };
