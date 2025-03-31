import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import trackingRoutes from './routes/tracking.js';
import fastifyJWT from '@fastify/jwt';
import connectDB from './db.js';
import zonesRoutes from './routes/zonesroute.js';
import authRoutes from './routes/auths.js';

import moveRoute from './routes/moveroute.js';

import emergencyRoute from './routes/emergencyroute.js';
import incidentsRoutes from './routes/incidents.js';
import exportRoute from './routes/export.js';

const fastify = Fastify({ logger: true });

// Verbindung zur Datenbank
await connectDB();

// Registriere fastify-jwt mit einem geheimen Schlüssel
await fastify.register(fastifyJWT, {
  secret: 'DEIN_GEHEIMER_SCHLÜSSEL'
});

// Registriere CORS
await fastify.register(fastifyCors, {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
});

// Registriere das WebSocket-Plugin
await fastify.register(fastifyWebsocket, {
  options: { 
    clientTracking: true 
  }
});

// Array zum Speichern der WebSocket-Verbindungen
let connections = new Set();

// Hilfsfunktion zum Broadcast
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  for (const connection of connections) {
    try {
      connection.send(messageStr);
    } catch (err) {
      fastify.log.error('Fehler beim Senden der Broadcast-Nachricht:', err);
    }
  }
}

// WebSocket Route
fastify.get('/ws', { websocket: true }, function wsHandler(connection) {
  fastify.log.info('Neuer WebSocket-Client verbunden.');
  
  connections.add(connection);

  // Sende Willkommensnachricht
  try {
    connection.send(JSON.stringify({
      type: 'notification',
      message: 'WebSocket Verbindung hergestellt',
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    fastify.log.error('Fehler beim Senden der Willkommensnachricht:', err);
  }

  // Message Handler
  connection.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());
      fastify.log.info('Nachricht empfangen:', message);

      // Echo die Nachricht zurück
      connection.send(JSON.stringify({
        type: 'echo',
        data: message,
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      fastify.log.error('Fehler beim Verarbeiten der Nachricht:', err);
    }
  });

  // Close Handler
  connection.on('close', () => {
    connections.delete(connection);
    fastify.log.info('WebSocket-Client hat die Verbindung geschlossen.');
  });
});

// Hilfsfunktion zum Senden von Benachrichtigungen
function sendNotification(message, type = 'info') {
  broadcast({
    type: 'notification',
    message: message,
    notificationType: type,
    timestamp: new Date().toISOString()
  });
}

// Root Route
fastify.get('/', async (request, reply) => {
  reply.send({ message: 'Willkommen bei der API!' });
});

// Dekoriere fastify mit den Broadcast-Funktionen
fastify.decorate('broadcast', broadcast);
fastify.decorate('sendNotification', sendNotification);

// Route Registrierungen
fastify.register(trackingRoutes, { 
  prefix: '/api',
  websocketConnections: connections,
  broadcast,
  sendNotification
});

fastify.register(zonesRoutes, { prefix: '/api' });
fastify.register(authRoutes, { prefix: '/api' });
fastify.register(emergencyRoute, { prefix: '/api' });
fastify.register(incidentsRoutes, { prefix: '/api' });
fastify.register(moveRoute, {prefix: '/api'});
fastify.register(exportRoute, { prefix: '/api' });

// Server starten
fastify.listen({ port: 3000 }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info('Server läuft auf Port 3000');
});


// Cleanup bei Server-Beendigung
process.on('SIGTERM', () => {
  for (const connection of connections) {
    try {
      connection.close();
    } catch (err) {
      fastify.log.error('Fehler beim Schließen der Verbindung:', err);
    }
  }
  connections.clear();
  fastify.close();
});