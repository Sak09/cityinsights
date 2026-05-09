require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db.config');
const City = require('../models/City.model');

const CITIES = [
  {
    name: 'New York',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7128,
    lon: -74.0060,
    currency: 'USD',
    timezone: 'America/New_York',
    population: 8336817,
  },
  {
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lon: -0.1278,
    currency: 'GBP',
    timezone: 'Europe/London',
    population: 8982000,
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    lat: 35.6762,
    lon: 139.6503,
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    population: 13960000,
  },
  {
    name: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    lat: 19.0760,
    lon: 72.8777,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    population: 20667656,
  },
  {
    name: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    lat: -33.8688,
    lon: 151.2093,
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    population: 5312000,
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    lat: 25.2048,
    lon: 55.2708,
    currency: 'AED',
    timezone: 'Asia/Dubai',
    population: 3331420,
  },
  {
    name: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BR',
    lat: -23.5505,
    lon: -46.6333,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    population: 12325232,
  },
  {
    name: 'Paris',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8566,
    lon: 2.3522,
    currency: 'EUR',
    timezone: 'Europe/Paris',
    population: 2148000,
  },
  {
    name: 'Beijing',
    country: 'China',
    countryCode: 'CN',
    lat: 39.9042,
    lon: 116.4074,
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
    population: 21893095,
  },
  {
    name: 'Cairo',
    country: 'Egypt',
    countryCode: 'EG',
    lat: 30.0444,
    lon: 31.2357,
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    population: 10107125,
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing cities
    await City.deleteMany({});
    console.log('🗑  Cleared existing cities');

    const inserted = await City.insertMany(CITIES);
    console.log(`✅ Seeded ${inserted.length} cities:`);
    inserted.forEach((c) => console.log(`   • ${c.name} (${c.countryCode}) — ${c.currency}`));

    console.log('\n🎉 Seed complete! Now run: npm run dev');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seed();
