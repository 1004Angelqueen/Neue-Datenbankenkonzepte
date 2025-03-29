import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/geoDB');


    // Optional: Mongoose-Optionen für bessere Fehlerbehandlung      
    console.log('MongoDB verbunden!');
  } catch (err) {
    console.error('MongoDB-Verbindungsfehler:', err);
  }
}
