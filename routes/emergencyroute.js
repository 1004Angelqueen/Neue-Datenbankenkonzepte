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


  // GET-Route: Alle Incidents abrufen, evtl. mit Filter nach Zone
  fastify.get('/emergency', async (request, reply) => {
    try {
      // Optional: Filterung nach Zone, wenn ein Query-Parameter "zone" gesendet wird
      const filter = request.query.zone ? { 'zone': request.query.zone } : {};
      const incidents = await Emergency.find(filter);
      reply.send(incidents);
    } catch (error) {
      fastify.log.error('Fehler beim Abrufen der Notfälle:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });

  // DELETE-Route: Incident anhand der _id löschen
  fastify.delete('/emergency/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const result = await Emergency.findByIdAndDelete(id);
      if (!result) {
        return reply.code(404).send({ error: 'Notfall nicht gefunden' });
      }
      reply.send({ message: 'Notfall erfolgreich gelöscht', emergency: result });
    } catch (error) {
      fastify.log.error('Fehler beim Löschen der Notfallmeldung:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });
}
