// routes/incidents.js
import Incident from '../models/Incident.js';

export default async function (fastify, opts) {
  fastify.get('/incidents', async (request, reply) => {
    try {
      const incidents = await Incident.find({});
      reply.send(incidents);
    } catch (err) {
      reply.code(500).send({ error: 'Fehler beim Abrufen der Incidents' });
    }
  });
}
