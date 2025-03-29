// models/Incident.js
import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  zone: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Incident', incidentSchema);
