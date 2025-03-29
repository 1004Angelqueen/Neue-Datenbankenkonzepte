// routes/auth.js
export default async function (fastify, opts) {
    // Anonymer Besucher-Login
    fastify.post('/login/visitor', async (request, reply) => {
      const { consent } = request.body;
      if (!consent) {
        return reply.code(400).send({ error: 'Zustimmung erforderlich.' });
      }
      const userId = `visitor_${Date.now()}`;
      const token = fastify.jwt.sign({ userId, role: 'visitor' });
      reply.send({ token, userId, role: 'visitor' });
    });
  
    // Admin-Login für andere Rollen (organizer, security, staff)
    fastify.post('/login/admin', async (request, reply) => {
      const { userId, password, role } = request.body;
      if (!userId || !password || !role) {
        return reply
          .code(400)
          .send({ error: 'userId, password und role sind erforderlich.' });
      }
      // Hier würdest du normalerweise eine echte Authentifizierung durchführen.
      // Für dieses Beispiel nehmen wir an, dass die Angaben korrekt sind.
      const token = fastify.jwt.sign({ userId, role });
      reply.send({ token, userId, role });
    });
  }
  