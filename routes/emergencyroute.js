import Emergency from '../models/emergency.js';
import Zone from '../models/Zone.js';

export default async function (fastify, opts) {
 // POST-Route zum Melden eines Notfalls
fastify.post('/emergency', async (request, reply) => {
  const { lat, lng, timestamp } = request.body;
  
  if (lat === undefined || lng === undefined || !timestamp) {
    return reply.code(400).send({ error: 'Fehlende Daten' });
  }
  
  try {
    // Finde eine Zone, in der der Punkt liegt
    const zone = await Zone.findOne({
      area: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          }
        }
      }
    });
    console.log("Gefundene Zone: ", zone);
    
    
    // Erstelle das Emergency-Dokument inklusive der Zone (falls gefunden)
    const newEmergency = new Emergency({
      type: 'emergency',
      location: { type: 'Point', coordinates: [lng, lat] },
      timestamp: new Date(timestamp),
      zone: zone ? zone.name : 'Unbekannt'  // Falls keine Zone gefunden wird, "Unbekannt"
    });
    
    await newEmergency.save();
    
    reply.code(201).send({ message: 'Notfall gemeldet', emergency: newEmergency });
  } catch (error) {
    fastify.log.error('Fehler beim Speichern der Notfallmeldung:', error);
    reply.code(500).send({ error: 'Serverfehler' });
  }
});


  // GET-Route zum Abrufen aller Emergencys
  fastify.get('/emergency', async (request, reply) => {
    try {
      // Nur Emergencys, die noch auf der Karte sichtbar sind, zurückliefern
      const emergencies = await Emergency.find({ visibleOnMap: true });
      reply.send(emergencies);
    } catch (error) {
      fastify.log.error('Fehler beim Abrufen der Notfälle:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });
  
  fastify.patch('/emergency/:id/dismiss', async (request, reply) => {
    const { id } = request.params;
    try {
      const emergency = await Emergency.findByIdAndUpdate(
        id,
        { visibleOnMap: false },
        { new: true }
      );
      if (!emergency) {
        return reply.code(404).send({ error: 'Notfall nicht gefunden' });
      }
      reply.send({ message: 'Notfall von der Karte entfernt', emergency });
    } catch (error) {
      fastify.log.error('Fehler beim Aktualisieren des Notfalls:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });
  

  fastify.delete('/emergency/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const result = await Emergency.findByIdAndDelete(id);
      if (!result) {
        return reply.code(404).send({ error: 'Notfall nicht gefunden' });
      }
      reply.send({ message: 'Notfall erfolgreich gelöscht', emergency: result });
    } catch (error) {
      fastify.log.error('Fehler beim Löschen der Notfallmeldung:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });
  
}
