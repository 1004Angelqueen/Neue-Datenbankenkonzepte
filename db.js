import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/geoDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    // Optional: Mongoose-Optionen für bessere Fehlerbehandlung      
    console.log('MongoDB verbunden!');
  } catch (err) {
    console.error('MongoDB-Verbindungsfehler:', err);
  }
}
