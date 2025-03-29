// models/Zone.js
import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true }, // maximale Anzahl an Besuchern in dieser Zone
  area: {
    type: { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true }
  }
});

// 2dsphere-Index für Geo-Abfragen
zoneSchema.index({ area: '2dsphere' });

export default mongoose.model('Zone', zoneSchema);
