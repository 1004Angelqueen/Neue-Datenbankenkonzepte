const express = require('express');
const router = express.Router();
const Emergency = require('../models/emergency'); // Mongoose-Modell

router.post('/emergency', async (req, res) => {
  const { lat, lng, timestamp } = req.body;
  
  // Validierung der eingehenden Daten
  if (!lat || !lng || !timestamp) {
    return res.status(400).json({ message: 'Fehlende Daten' });
  }
  
  try {
    // Neue Notfallmeldung anlegen
    const newEmergency = new Emergency({
      type: 'emergency',
      location: { type: 'Point', coordinates: [lng, lat] },
      timestamp: new Date(timestamp)
    });
    
    // In der Datenbank speichern
    await newEmergency.save();
    
    res.status(201).json({ message: 'Notfall gemeldet', emergency: newEmergency });
  } catch (error) {
    console.error('Fehler beim Speichern der Notfallmeldung:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

module.exports = router;
