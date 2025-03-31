import mongoose from 'mongoose';

const exportRoute = async (fastify, opts) => {
  fastify.get('/export-data', async (request, reply) => {
    try {
      // Collections über Mongoose abfragen
      const [tracking, zones] = await Promise.all([
        mongoose.connection.collection('tracking').find({}).toArray(),
        mongoose.connection.collection('zones').find({}).toArray()
      ]);

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString()
            .replace('T', ' ')
            .substr(0, 19),
          exportedBy: "admin_user",
          exportType: 'event-data'
        },
        data: {
          tracking,
          zones
        }
      };

      return reply.send(exportData);
    } catch (error) {
      request.log.error('Export-Fehler:', error);
      return reply.code(500).send({ 
        error: 'Fehler beim Exportieren der Daten',
        message: error.message 
      });
    }
  });
};

export default exportRoute;