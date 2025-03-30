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

    try {
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

      // Falls eine Zone gefunden wurde, verwende deren Name, ansonsten "Unbekannt"
      const zoneName = zone ? zone.name : 'Unbekannt';

      // Logge das Ergebnis der Zone-Abfrage
      fastify.log.info('Gefundene Zone:', zoneName);


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

      // Wenn eine Zone gefunden wurde und sie eine Kapazität hat, prüfe die Besucheranzahl
      if (zone && zone.capacity) {
        const count = await Visitor.countDocuments({ zone: zoneName });
        if (count > zone.capacity) {
          // Erzeuge einen Incident, falls überfüllt
          const incident = new Incident({
            zone: zoneName,
            message: `Zone "${zoneName}" ist überfüllt: ${count} Besucher (Kapazität: ${zone.capacity}).`
          });
          await incident.save();

          // Sende den Incident per WebSocket an alle Clients
          const incidentPayload = JSON.stringify({ incident: incident });
          wsConnections.forEach(conn => {
            conn.send(incidentPayload);
          });
        }
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

      // Sende den aktualisierten Besucher an alle WebSocket-Clients
      const payload = JSON.stringify(visitor);
      wsConnections.forEach(conn => {
        conn.send(payload);
      });

      reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Fehler beim Tracken:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }


    // Antwort wird immer gesendet, egal ob eine Zone gefunden wurde oder nicht.
    reply.send({ success: true });

  }});

  fastify.get('/heatmap', async (request, reply) => {
    try {
      const all = await Visitor.find({});
      reply.send(all);
    } catch (error) {
      fastify.log.error('Fehler beim Abrufen der Heatmap-Daten:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });
}