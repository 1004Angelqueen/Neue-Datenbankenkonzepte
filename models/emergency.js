import mongoose from 'mongoose';

const EmergencySchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  timestamp: { type: Date, default: Date.now },
  visibleOnMap: { type: Boolean, default: true },
  zone: { type: String, default: 'Unbekannt' } // Neues Feld für den Zonennamen
});

// Geo-Index erstellen
EmergencySchema.index({ location: '2dsphere' });

export default mongoose.model('Emergency', EmergencySchema);
