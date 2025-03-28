import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  userId: String,
  role: String,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Erstelle einen 2dsphere Index für Geo-Abfragen
visitorSchema.index({ location: '2dsphere' });

export default mongoose.model('Visitor', visitorSchema);
