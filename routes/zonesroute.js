// routes/zones.js
import Zone from '../models/Zone.js';

export default async function (fastify, opts) {
  // Alle Zonen abrufen
  fastify.get('/zones', async (request, reply) => {
    try {
      const zones = await Zone.find({});
      reply.send(zones);
    } catch (err) {
      reply.code(500).send({ error: 'Fehler beim Abrufen der Zonen' });
    }
  });

  fastify.post('/zones', async (request, reply) => {
    try {
      const { name, capacity, area } = request.body;  // <-- capacity mit auslesen
      if (!name || !capacity || !area) {
        return reply.code(400).send({ error: 'Name, Capacity und Area sind erforderlich' });
      }
      const zone = new Zone({ name, capacity, area });  // <-- capacity mit übergeben
      await zone.save();
      reply.send(zone);
    } catch (err) {
      console.error(err);  // <-- Logge den eigentlichen Fehler
      reply.code(500).send({ error: 'Fehler beim Speichern der Zone' });
    }
  });
  
  // Alle Zonen löschen (zum Beispiel für Testzwecke)
  fastify.delete('/zones', async (request, reply) => {
    try {
      await Zone.deleteMany({});
      reply.send({ success: true });
    } catch (err) {
      reply.code(500).send({ error: 'Fehler beim Löschen der Zonen' });
    }
  });
}
