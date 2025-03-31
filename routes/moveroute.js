import Visitor from '../models/Visitor.js';

// Konstanten
const isMovementActive = { value: false };
const UPDATE_INTERVAL = 2000; // 2 Sekunden
const MOVEMENT_SPEED = 0.00001;

// Polygon für die Haupttribüne im GeoJSON-Format: [longitude, latitude]
const FIXED_POLYGON = [
  [10.28908, 48.6977],
  [10.28953, 48.69803],
  [10.29178, 48.69661],
  [10.29117, 48.69611]
];

// Hilfsfunktionen
function getBoundingBox(polygon) {
  try {
    if (!Array.isArray(polygon) || polygon.length === 0) {
      throw new Error('Ungültiges Polygon');
    }
    return polygon.reduce((box, point) => ({
      minX: Math.min(box.minX, point[0]),
      maxX: Math.max(box.maxX, point[0]),
      minY: Math.min(box.minY, point[1]),
      maxY: Math.max(box.maxY, point[1])
    }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  } catch (error) {
    console.error('Fehler in getBoundingBox:', error);
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
}

function pointInPolygon(point, polygon) {
  try {
    if (!Array.isArray(point) || point.length !== 2 || !Array.isArray(polygon)) {
      return false;
    }
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      if (isNaN(xi) || isNaN(yi) || isNaN(xj) || isNaN(yj)) {
        console.error('Ungültige Polygon-Koordinaten');
        return false;
      }
      const intersect = ((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  } catch (error) {
    console.error('Fehler in pointInPolygon:', error);
    return false;
  }
}

function getRandomPointInPolygon(polygon) {
  try {
    const bounds = getBoundingBox(polygon);
    let point;
    let attempts = 0;
    const maxAttempts = 100;
    do {
      point = [
        bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
      ];
      attempts++;
      if (attempts >= maxAttempts) {
        console.warn('Maximale Versuche erreicht, verwende Polygonzentrum');
        return [(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2];
      }
    } while (!pointInPolygon(point, polygon));
    return point;
  } catch (error) {
    console.error('Fehler in getRandomPointInPolygon:', error);
    return polygon[0];
  }
}

function moveTowardsPoint(currentPosition, targetPosition, movementSpeed) {
  try {
    if (!Array.isArray(currentPosition) || !Array.isArray(targetPosition) ||
        currentPosition.length !== 2 || targetPosition.length !== 2) {
      console.error('Ungültige Koordinaten:', { currentPosition, targetPosition });
      return currentPosition;
    }
    const dx = targetPosition[0] - currentPosition[0];
    const dy = targetPosition[1] - currentPosition[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < movementSpeed || isNaN(distance)) {
      return targetPosition;
    }
    const ratio = movementSpeed / distance;
    const newPosition = [
      currentPosition[0] + dx * ratio,
      currentPosition[1] + dy * ratio
    ];
    if (newPosition.some(coord => isNaN(coord))) {
      console.error('Ungültige neue Position berechnet:', newPosition);
      return currentPosition;
    }
    return newPosition;
  } catch (error) {
    console.error('Fehler in moveTowardsPoint:', error);
    return currentPosition;
  }
}

export default async function (fastify, opts) {
  if (!global.activeIntervals) {
    global.activeIntervals = new Map();
  }
  
  // Endpoint zum Starten der Bewegung
  fastify.patch('/move-visitors-continuous', async (request, reply) => {
    try {
      console.log("[Start] Kontinuierliche Bewegung der Besucher");
      // Cleanup vorheriger Intervalle
      if (global.activeIntervals) {
        for (const intervalId of global.activeIntervals.values()) {
          clearInterval(intervalId);
        }
        global.activeIntervals.clear();
      }
      isMovementActive.value = true;
      // Hole alle existierenden Besucher
      const visitors = await Visitor.find({}).lean();
      if (!visitors || visitors.length === 0) {
        return reply.code(404).send({
          message: "Keine Besucher gefunden",
          status: 'error'
        });
      }
      console.log(`${visitors.length} Besucher gefunden`);
      // Starte Bewegung für jeden Besucher
      for (const visitor of visitors) {
        try {
          // Initialisiere Zielpunkt falls nötig
          if (!visitor.targetPoint) {
            await Visitor.updateOne(
              { _id: visitor._id },
              { 
                $set: { 
                  targetPoint: getRandomPointInPolygon(FIXED_POLYGON),
                  lastUpdated: new Date()
                }
              }
            );
          }
          const moveInterval = setInterval(async () => {
            if (!isMovementActive.value) {
              clearInterval(moveInterval);
              return;
            }
            try {
              const currentVisitor = await Visitor.findById(visitor._id);
              if (!currentVisitor) {
                clearInterval(moveInterval);
                return;
              }
              const currentPos = currentVisitor.location.coordinates;
              let targetPos = currentVisitor.targetPoint;
              // Wenn Ziel erreicht oder kein Ziel gesetzt, neues Ziel setzen
              if (!targetPos ||
                  (Math.abs(currentPos[0] - targetPos[0]) < MOVEMENT_SPEED &&
                   Math.abs(currentPos[1] - targetPos[1]) < MOVEMENT_SPEED)) {
                targetPos = getRandomPointInPolygon(FIXED_POLYGON);
              }
              // Berechne die neue Position und prüfe, ob sie im Polygon liegt
              let newPos = moveTowardsPoint(currentPos, targetPos, MOVEMENT_SPEED);
              if (!pointInPolygon(newPos, FIXED_POLYGON)) {
                console.warn(`Berechnete Position außerhalb des Polygons (${newPos}). Setze neue Position im gültigen Bereich.`);
                newPos = getRandomPointInPolygon(FIXED_POLYGON);
                targetPos = newPos;
              }
              // Update nur wenn sich die Position tatsächlich geändert hat
              if (newPos[0] !== currentPos[0] || newPos[1] !== currentPos[1]) {
                await Visitor.updateOne(
                  { _id: visitor._id },
                  { 
                    $set: { 
                      'location.coordinates': newPos,
                      targetPoint: targetPos,
                      lastUpdated: new Date()
                    }
                  }
                );
              }
            } catch (error) {
              console.error(`Fehler bei Besucher Update ${visitor._id}:`, error);
            }
          }, UPDATE_INTERVAL);
          global.activeIntervals.set(visitor._id.toString(), moveInterval);
        } catch (error) {
          console.error(`Fehler beim Setup für Besucher ${visitor._id}:`, error);
        }
      }
      reply.send({
        message: `Kontinuierliche Bewegung gestartet für ${visitors.length} Besucher`,
        activeVisitors: visitors.length,
        status: 'active'
      });
    } catch (error) {
      console.error("Fehler beim Starten der Bewegung:", error);
      isMovementActive.value = false;
      reply.code(500).send({
        message: "Fehler beim Starten der Bewegung",
        error: error.message
      });
    }
  });

  // Endpoint zum Stoppen der Bewegung
  fastify.post('/stop-visitors-movement', async (request, reply) => {
    try {
      console.log("[Stop] Stoppe Bewegungen");
      isMovementActive.value = false;
      const stoppedCount = global.activeIntervals ? global.activeIntervals.size : 0;
      if (global.activeIntervals) {
        for (const intervalId of global.activeIntervals.values()) {
          clearInterval(intervalId);
        }
        global.activeIntervals.clear();
      }
      reply.send({
        message: `${stoppedCount} Bewegungen gestoppt`,
        status: 'stopped'
      });
    } catch (error) {
      console.error("Fehler beim Stoppen:", error);
      reply.code(500).send({
        message: "Fehler beim Stoppen der Bewegung",
        error: error.message
      });
    }
  });
}
