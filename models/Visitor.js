import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Eventveranstalter', 'Besucher', 'Security', 'Sanitäter', 'Standbetreiber'], 
    required: true 
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  zone: String,
  lastUpdated: { type: Date, default: Date.now }
});


// Erstelle einen 2dsphere Index für Geo-Abfragen
visitorSchema.index({ location: '2dsphere' });

export default mongoose.model('Visitor', visitorSchema);
