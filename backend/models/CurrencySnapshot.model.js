const mongoose = require('mongoose');

/**
 * CurrencySnapshot Model
 * Exchange rates for each city's local currency vs INR and USD.
 * TTL index auto-deletes records older than 15 days.
 */
const CurrencySnapshotSchema = new mongoose.Schema(
  {
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true,
    },
    baseCurrency: { type: String, required: true }, // e.g. "USD"
    rateToINR:    { type: Number, default: null },  // 1 BASE = X INR
    rateToUSD:    { type: Number, default: null },  // 1 BASE = X USD
    rateToEUR:    { type: Number, default: null },
    rateToGBP:    { type: Number, default: null },
    rates:        { type: Map, of: Number },        // full rates map
    fetchedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CurrencySnapshotSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 });
CurrencySnapshotSchema.index({ cityId: 1, fetchedAt: -1 });

module.exports = mongoose.model('CurrencySnapshot', CurrencySnapshotSchema);
