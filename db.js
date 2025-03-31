import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    const mongoURI = 'mongodb://localhost:27017/eventDB';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    
    db.on('error', (error) => {
      console.error('MongoDB Verbindungsfehler:', error);
    });

    db.once('open', () => {
      console.log('MongoDB erfolgreich verbunden!');
      // Test-Query
      db.collection('zones').countDocuments({}, (err, count) => {
        if (err) {
          console.error('Fehler beim Zählen der Zonen:', err);
        } else {
          console.log(`Anzahl der Zonen in der Datenbank: ${count}`);
        }
      });
    });

  } catch (err) {
    console.error('MongoDB-Verbindungsfehler:', err);
  }
}