// routes/emergency.js
import Emergency from '../models/Emergency.js';

export default async function (fastify, opts) {
  fastify.post('/emergency', async (request, reply) => {
    const { lat, lng, timestamp } = request.body;

    // Validierung der eingehenden Daten
    if (lat === undefined || lng === undefined || !timestamp) {
      return reply.code(400).send({ error: 'Fehlende Daten' });
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

      reply.code(201).send({ message: 'Notfall gemeldet', emergency: newEmergency });
    } catch (error) {
      fastify.log.error('Fehler beim Speichern der Notfallmeldung:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });

  fastify.get('/emergency', async (request, reply) => {
    try {
      const emergencies = await Emergency.find({});
      reply.send(emergencies);
    } catch (error) {
      fastify.log.error('Fehler beim Abrufen der Notfälle:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });
}
