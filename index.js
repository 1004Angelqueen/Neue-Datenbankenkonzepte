import Fastify from 'fastify';
import trackingRoutes from './routes/tracking.js';
import connectDB from './db.js';

const fastify = Fastify({ logger: true });

// Stelle Verbindung zur Datenbank her
connectDB();

// Registriere die Tracking-Routen unter dem Pfad /api
fastify.register(trackingRoutes, { prefix: '/api' });

// Starte den Server auf Port 3000
fastify.listen({ port: 3000 }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info('Server läuft auf Port 3000');
});
