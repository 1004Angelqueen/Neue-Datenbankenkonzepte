import Visitor from '../models/Visitor.js';

export default async function (fastify, opts) {
  // Greife auf die WebSocket-Verbindungen zu, die im Options-Objekt übergeben wurden
  const wsConnections = opts.websocketConnections || [];

  fastify.post('/track', async (request, reply) => {
    const { userId, role, latitude, longitude } = request.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return reply.code(400).send({ error: 'Fehlende Daten' });
    }

    const visitor = await Visitor.findOneAndUpdate(
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

    // Sende den neuen Standort an alle WebSocket-Clients
    const payload = JSON.stringify(visitor);
    wsConnections.forEach(connection => {
      connection.send(payload);
    });

    reply.send({ success: true });
  });

  fastify.get('/heatmap', async (request, reply) => {
    const all = await Visitor.find({});
    reply.send(all);
  });
}