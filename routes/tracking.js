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
      // Zone finden
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

      const zoneName = zone ? zone.name : 'Unbekannt';
      fastify.log.info('Gefundene Zone:', zoneName);

      // Besucher aktualisieren
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

      // Kapazitätsprüfung
      if (zone?.capacity) {
        const count = await Visitor.countDocuments({ zone: zoneName });
        
        // Für volle Zone
        if (count >= zone.capacity) {
          const incidentData = {
            type: 'full',
            zone: zoneName,
            message: `Zone "${zoneName}" ist voll: ${count} Besucher (Kapazität: ${zone.capacity}).`
          };
          
          // Incident in DB speichern
          const incident = new Incident(incidentData);
          await incident.save();

          // Separate Nachrichten für Security und normale Benutzer
          const securityNotification = {
            type: 'full',
            zone: zoneName,
            message: `Zone "${zoneName}" ist voll: ${count} Besucher (Kapazität: ${zone.capacity}).`,
            requiresAction: true // Flag für Security-relevante Nachrichten
          };

          const regularNotification = {
            type: 'full',
            zone: zoneName,
            message: `Zone "${zoneName}" ist voll: ${count} Besucher (Kapazität: ${zone.capacity}).`,
            requiresAction: false
          };

          // An alle Clients senden, aber mit unterschiedlichen Notifications
          wsConnections.forEach(conn => {
            const wsMessage = {
              incident: {
                ...incident.toObject(),
                type: 'full'
              },
              // Wenn der Client Security ist, Security-Notification senden, sonst reguläre
              notification: conn.userRole === 'security' ? securityNotification : regularNotification
            };
            conn.send(JSON.stringify(wsMessage));
          });
        } 
        // Für halb volle Zone
        else if (count >= zone.capacity / 2 && count < zone.capacity) {
          const incidentData = {
            type: 'half',
            zone: zoneName,
            message: `Warnung: Zone "${zoneName}" ist zur Hälfte gefüllt: ${count} Besucher (Kapazität: ${zone.capacity}).`
          };
          
          // Incident in DB speichern
          const incident = new Incident(incidentData);
          await incident.save();

          // Notification vorbereiten
          const notification = {
            type: 'half',
            zone: zoneName,
            message: `Warnung: Zone "${zoneName}" ist zur Hälfte gefüllt: ${count} Besucher (Kapazität: ${zone.capacity}).`
          };

          // WebSocket-Nachricht mit korrektem type-Feld senden
          const wsMessage = {
            incident: {
              ...incident.toObject(),
              type: 'half' // Explizit den type setzen
            },
            notification
          };

          // An alle Clients senden
          wsConnections.forEach(conn => {
            conn.send(JSON.stringify(wsMessage));
          });
        }
      }

      // Besucher-Update an alle Clients senden
      const visitorPayload = JSON.stringify(visitor);
      wsConnections.forEach(conn => {
        conn.send(visitorPayload);
      });

      reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Fehler beim Tracken:', error);
      reply.code(500).send({ error: 'Serverfehler' });
    }
  });

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