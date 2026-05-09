const mongoose = require('mongoose');

/**
 * WeatherSnapshot Model
 * One document per city per fetch (every 30 min).
 * TTL index auto-deletes records older than 15 days.
 */
const WeatherSnapshotSchema = new mongoose.Schema(
  {
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true,
    },
    temperature:  { type: Number, default: null },  // °C
    feelsLike:    { type: Number, default: null },  // °C
    tempMin:      { type: Number, default: null },
    tempMax:      { type: Number, default: null },
    humidity:     { type: Number, default: null },  // %
    pressure:     { type: Number, default: null },  // hPa
    windSpeed:    { type: Number, default: null },  // m/s
    windDeg:      { type: Number, default: null },  // degrees
    windGust:     { type: Number, default: null },
    visibility:   { type: Number, default: null },  // meters
    description:  { type: String, default: '' },
    icon:         { type: String, default: '' },
    clouds:       { type: Number, default: null },  // %
    sunrise:      { type: Number, default: null },  // unix timestamp
    sunset:       { type: Number, default: null },
    fetchedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-delete after 15 days
WeatherSnapshotSchema.index(
  { fetchedAt: 1 },
  { expireAfterSeconds: 15 * 24 * 60 * 60 }
);

// Compound index for efficient history queries
WeatherSnapshotSchema.index({ cityId: 1, fetchedAt: -1 });

module.exports = mongoose.model('WeatherSnapshot', WeatherSnapshotSchema);
