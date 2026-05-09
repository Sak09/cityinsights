const mongoose = require('mongoose');

/**
 * City Model — stores static city metadata
 * Seeded once via scripts/seedCities.js
 */
const CitySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, index: true },
    country:     { type: String, required: true, trim: true },
    countryCode: { type: String, required: true, uppercase: true, maxlength: 2 },
    lat:         { type: Number, required: true, min: -90,  max: 90  },
    lon:         { type: Number, required: true, min: -180, max: 180 },
    currency:    { type: String, required: true, uppercase: true, maxlength: 3 },
    timezone:    { type: String, required: true },
    population:  { type: Number, default: null },
    flag:        { type: String, default: '' }, // emoji flag
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Virtual: emoji flag from countryCode
CitySchema.virtual('flagEmoji').get(function () {
  return this.countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
});

module.exports = mongoose.model('City', CitySchema);
