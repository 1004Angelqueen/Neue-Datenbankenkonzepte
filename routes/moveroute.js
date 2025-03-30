import Visitor from '../models/Visitor.js';
import Zone from '../models/Zone.js';

// Funktion: Berechnet einen zufälligen Zielpunkt, der maximal maxDistance (in Metern)
// vom Ausgangspunkt (lat, lng) entfernt ist.
function randomDestinationPoint(lat, lng, maxDistance) {
  console.log(`Berechne neuen Punkt für (lat: ${lat}, lng: ${lng}) mit maxDistance: ${maxDistance}m`);
  const R = 6371000; // Erdradius in Metern
  const d = Math.random() * maxDistance;
  const bearing = Math.random() * 2 * Math.PI;
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(d / R) +
    Math.cos(latRad) * Math.sin(d / R) * Math.cos(bearing)
  );
  const newLngRad = lngRad + Math.atan2(
    Math.sin(bearing) * Math.sin(d / R) * Math.cos(latRad),
    Math.cos(d / R) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  const newLat = newLatRad * 180 / Math.PI;
  const newLng = newLngRad * 180 / Math.PI;
  console.log(`Neuer Punkt berechnet: [${newLng.toFixed(6)}, ${newLat.toFixed(6)}]`);
  return [newLng, newLat]; // GeoJSON-Format: [lng, lat]
}

// Funktion: Prüft mittels Ray-Casting, ob ein Punkt (im Format [lng, lat]) innerhalb eines Polygons liegt.
function pointInPolygon(point, polygon) {
  let x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0], yi = polygon[i][1];
    let xj = polygon[j][0], yj = polygon[j][1];
    let intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / ((yj - yi) || 0.0000001) + xi);
    if (intersect) inside = !inside;
  }
  console.log(`Prüfe Punkt [${point[0].toFixed(6)}, ${point[1].toFixed(6)}] im Polygon: ${inside}`);
  return inside;
}

export default async function (fastify, opts) {
  fastify.patch('/move-visitors-continuous', async (request, reply) => {
    try {
      console.log("PATCH /move-visitors-continuous aufgerufen");

      // Finde die definierte Zone anhand des Namens "Haupttribüne - Dreieck"
      const zone = await Zone.findOne({ name: "Haupttribüne - Dreieck" });
      if (!zone) {
        console.log("Zone 'Haupttribüne - Dreieck' nicht gefunden");
        return reply.code(404).send({ error: "Zone nicht gefunden" });
      }
      console.log("Gefundene Zone:", zone.name);

      // Das Polygon aus der Zone – hier wird angenommen, dass der äußere Ring in zone.area.coordinates[0] steht.
      // Achte darauf, dass die Koordinaten im GeoJSON-Format vorliegen: [lng, lat]
      const polygon = zone.area.coordinates[0];
      console.log("Polygonkoordinaten:", polygon);

      // Alle Besucher abrufen
      const visitors = await Visitor.find({});
      console.log(`Anzahl der Besucher: ${visitors.length}`);

      let updatedCount = 0;
      const maxDistance = 0.5; // maximal 0,5 Meter pro Bewegungsschritt

      for (const visitor of visitors) {
        console.log(`Verarbeite Besucher: ${visitor.userId}`);
        // Aktueller Standort im GeoJSON-Format: [lng, lat]
        const currentCoords = visitor.location.coordinates;
        const currentLng = currentCoords[0];
        const currentLat = currentCoords[1];

        let newPoint = [currentLng, currentLat];
        let attempts = 0;
        const maxAttempts = 100;

        // Generiere einen neuen Punkt, der maximal 0,5 m vom aktuellen Standort entfernt ist,
        // und prüfe, ob er innerhalb des Polygons liegt.
        do {
          newPoint = randomDestinationPoint(currentLat, currentLng, maxDistance);
          attempts++;
        } while (!pointInPolygon(newPoint, polygon) && attempts < maxAttempts);

        if (attempts < maxAttempts) {
          console.log(`Besucher ${visitor.userId} bewegt von [${currentLng}, ${currentLat}] nach [${newPoint[0]}, ${newPoint[1]}]`);
          visitor.location = { type: "Point", coordinates: newPoint };
          visitor.lastUpdated = new Date();
          await visitor.save();
          updatedCount++;
        } else {
          console.warn(`Kein gültiger Punkt für Besucher ${visitor.userId} gefunden nach ${attempts} Versuchen`);
        }
      }

      console.log(`Bewegung abgeschlossen: ${updatedCount} Besucher aktualisiert.`);
      reply.send({ message: `Besucher wurden bewegt (${updatedCount} aktualisiert).` });
    } catch (error) {
      console.error("Fehler beim Bewegen der Besucher:", error);
      reply.code(500).send({ error: "Serverfehler" });
    }
  });
}
