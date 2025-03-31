import mongoose from 'mongoose';

const exportRoute = async (fastify, opts) => {
  fastify.get('/export-data', async (request, reply) => {
    try {
      // Aktuelles Datum im gewünschten Format
      const currentDate = new Date().toISOString()
        .replace('T', ' ')
        .slice(0, 19);

      // Mongoose Modelle verwenden
      const tracking = await mongoose.connection.db.collection('tracking').find({}).toArray();
      const zones = await mongoose.connection.db.collection('zones').find({}).toArray();
      const events = await mongoose.connection.db.collection('events').find({}).toArray();
      const heatmap = await mongoose.connection.db.collection('heatmap').find({}).toArray();

      const exportData = {
        metadata: {
          timestamp: currentDate,
          user: "admin_user",
          type: 'event-data'
        },
        data: {
          tracking: tracking,
          zones: zones,
          events: events,
          heatmap: heatmap,
          statistics: {
            totalTracking: tracking.length,
            totalZones: zones.length,
            totalEvents: events.length,
            totalHeatmapPoints: heatmap.length
          }
        }
      };

      return reply.send(exportData);
    } catch (error) {
      fastify.log.error('Export-Fehler:', error);
      return reply.code(500).send({ 
        error: 'Export fehlgeschlagen',
        message: error.message,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
    }
  });
};

export default exportRoute;