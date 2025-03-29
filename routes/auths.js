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
  
  // Admin-Login: Hier geben Benutzer ihre Daten ein
  fastify.post('/login/admin', async (request, reply) => {
    const { userId, password, role } = request.body;
    if (!userId || !password || !role) {
      return reply.code(400).send({ error: 'userId, password und role sind erforderlich.' });
    }
    // Validierung: Prüfe, ob die übergebene Rolle zu den erlaubten Werten gehört
    const allowedRoles = ['Eventveranstalter', 'Security', 'Sanitäter', 'Standbetreiber'];
    if (!allowedRoles.includes(role)) {
      return reply.code(403).send({ error: 'Diese Rolle ist nicht erlaubt.' });
    }
    // In einer echten Anwendung würdest du hier ein Passwort überprüfen
    const token = fastify.jwt.sign({ userId, role });
    reply.send({ token, userId, role });
  });
  }
  