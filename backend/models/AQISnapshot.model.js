const mongoose = require('mongoose');

/**
 * AQISnapshot Model
 * Air quality data from OpenWeatherMap Air Pollution API.
 * TTL index auto-deletes records older than 15 days.
 */
const AQISnapshotSchema = new mongoose.Schema(
  {
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true,
    },
    // AQI scale 1–5: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
    aqi:      { type: Number, default: null, min: 1, max: 5 },
    category: { type: String, default: '' },
    // Component concentrations (μg/m³)
    pm25:     { type: Number, default: null },
    pm10:     { type: Number, default: null },
    co:       { type: Number, default: null },
    no:       { type: Number, default: null },
    no2:      { type: Number, default: null },
    o3:       { type: Number, default: null },
    so2:      { type: Number, default: null },
    nh3:      { type: Number, default: null },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AQISnapshotSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 });
AQISnapshotSchema.index({ cityId: 1, fetchedAt: -1 });

module.exports = mongoose.model('AQISnapshot', AQISnapshotSchema);
