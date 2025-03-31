import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    // Wenn deine Anwendung auch in Docker läuft
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? 'mongodb://mongodb:27017/eventDB'
      : 'mongodb://localhost:27017/eventDB';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB verbunden!');
  } catch (err) {
    console.error('MongoDB-Verbindungsfehler:', err);
    // Optional: Retry-Logik hier implementieren
    setTimeout(connectDB, 5000); // Versuche nach 5 Sekunden erneut zu verbinden
  }
}