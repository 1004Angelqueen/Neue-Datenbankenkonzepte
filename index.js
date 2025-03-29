import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import trackingRoutes from './routes/tracking.js';
import fastifyJWT from '@fastify/jwt';
import connectDB from './db.js';
import zonesRoutes from './routes/zonesroute.js';
import authRoutes from './routes/auths.js';

const fastify = Fastify({ logger: true });

// Verbindung zur Datenbank
await connectDB();

// Registriere fastify-jwt mit einem geheimen Schlüssel
await fastify.register(fastifyJWT, {
  secret: 'DEIN_GEHEIMER_SCHLÜSSEL' // Ersetze diesen Schlüssel mit einem sicheren, langen Schlüssel
});
// Registriere CORS (wie zuvor)
await fastify.register(fastifyCors, {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
});

// Registriere das WebSocket-Plugin
await fastify.register(fastifyWebsocket);

// Array zum Speichern der WebSocket-Verbindungen
let connections = [];

fastify.get('/ws', { websocket: true }, (connection, req) => {
  // Füge die Verbindung zu unserem Array hinzu
  connections.push(connection);
  fastify.log.info('Neuer WebSocket-Client verbunden.');

  // Verwende direkt connection.on('close', ...) anstelle von connection.socket.on(...)
  connection.on('close', () => {
    connections = connections.filter(conn => conn !== connection);
    fastify.log.info('WebSocket-Client hat die Verbindung geschlossen.');
  });
});

fastify.get('/', async (request, reply) => {
  reply.send({ message: 'Willkommen bei der API!' });
});



// In deinen bestehenden Routen, z. B. im /api/track-Endpoint,
// kannst du nach dem Speichern eines Standortes den neuen Standort an alle Clients senden:
fastify.register(trackingRoutes, { prefix: '/api', websocketConnections: connections });
fastify.register(zonesRoutes, { prefix: '/api' });
// Registriere die Auth-Routen unter /api
fastify.register(authRoutes, { prefix: '/api' });

// Starte den Server
fastify.listen({ port: 3000 }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info('Server läuft auf Port 3000');
});
