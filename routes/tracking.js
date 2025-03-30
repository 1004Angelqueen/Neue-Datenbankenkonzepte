import Visitor from '../models/Visitor.js';
import Zone from '../models/Zone.js';
import Incident from '../models/Incident.js';

export default async function (fastify, opts) {
  const wsConnections = opts.websocketConnections || [];

  fastify.post('/track', async (request, reply) => {
    const { userId, role, latitude, longitude } = request.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return reply.code(400).send({ error: 'Fehlende Daten' });
    }

    // Finde eine Zone, in der der Punkt liegt.
    // GeoJSON-Koordinaten sind im Format [longitude, latitude].
    const zone = await Zone.findOne({
      area: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          }
        }
      }
    });

    // Falls eine Zone gefunden wurde, verwende deren Name, sonst null.
    const zoneName = zone ? zone.name : null;

    // Besucher-Dokument updaten oder erstellen, inklusive Zonen-Zuweisung
    const visitor = await Visitor.findOneAndUpdate(
      { userId },
      {
        userId,
        role,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        zone: zoneName,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

   // Innerhalb der '/track' Route, wo die Kapazität geprüft wird
if (zone && zone.capacity) {
  const count = await Visitor.countDocuments({ zone: zoneName });

  // Wenn die Zone voll ist
  if (count >= zone.capacity) {
    const incident = new Incident({
      type: 'full',  // Wichtig: Type hinzufügen
      zone: zoneName,
      message: `Zone "${zoneName}" ist voll: ${count} Besucher (Kapazität: ${zone.capacity}).`
    });
    await incident.save();
    
    // Beide senden: incident UND notification
    const notification = {
      type: 'full',
      zone: zoneName,
      message: `Zone "${zoneName}" ist voll: ${count} Besucher (Kapazität: ${zone.capacity}).`
    };
    
    wsConnections.forEach(conn => {
      conn.send(JSON.stringify({ 
        incident: incident,
        notification: notification 
      }));
    });
  }
  // Wenn die Zone zur Hälfte gefüllt ist
  else if (count >= zone.capacity / 2 && count < zone.capacity) {
    const incident = new Incident({
      type: 'half',  // Wichtig: Type hinzufügen
      zone: zoneName,
      message: `Warnung: Zone "${zoneName}" ist zur Hälfte gefüllt: ${count} Besucher (Kapazität: ${zone.capacity}).`
    });
    await incident.save();
    
    // Beide senden: incident UND notification
    const notification = {
      type: 'half',
      zone: zoneName,
      message: `Warnung: Zone "${zoneName}" ist zur Hälfte gefüllt: ${count} Besucher (Kapazität: ${zone.capacity}).`
    };
    
    wsConnections.forEach(conn => {
      conn.send(JSON.stringify({ 
        incident: incident,
        notification: notification 
      }));
    });
      }
    }

    // Antwort wird immer gesendet, egal ob eine Zone gefunden wurde oder nicht.
    reply.send({ success: true });
  });

  fastify.get('/heatmap', async (request, reply) => {
    const all = await Visitor.find({});
    reply.send(all);
  });
}