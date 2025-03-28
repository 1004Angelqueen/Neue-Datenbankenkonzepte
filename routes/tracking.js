import Visitor from '../models/Visitor.js';

export default async function (fastify, opts) {
  // Endpoint zum Empfangen der Standortdaten
  fastify.post('/track', async (request, reply) => {
    const { userId, role, latitude, longitude } = request.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return reply.code(400).send({ error: 'Fehlende Daten' });
    }

    // Update oder erstelle den Eintrag für diesen Benutzer
    await Visitor.findOneAndUpdate(
      { userId },
      {
        userId,
        role,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    reply.send({ success: true });
  });
}
