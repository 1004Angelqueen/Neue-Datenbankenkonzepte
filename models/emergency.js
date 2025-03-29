const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  timestamp: { type: Date, default: Date.now }
});

// Geo-Index erstellen für raumbezogene Abfragen
EmergencySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Emergency', EmergencySchema);
