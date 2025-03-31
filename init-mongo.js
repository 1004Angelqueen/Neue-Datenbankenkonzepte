// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-31 21:32:32
// Current User's Login: 1004Angelqueen

// Create database and switch to it
db = db.getSiblingDB('eventDB');

// Drop existing collections
db.emergencies.drop();
db.incidents.drop();
db.locations.drop();
db.visitors.drop();
db.zones.drop();

// Create collections
db.createCollection('emergencies');
db.createCollection('incidents');
db.createCollection('locations');
db.createCollection('visitors');
db.createCollection('zones');

// Insert zone data - exactly as specified in your JSON
db.zones.insertMany([
  {
    name: "Eingang - Viereck",
    capacity: 4,
    area: {
      type: "Polygon",
      coordinates: [[
        [10.289091, 48.698008],
        [10.289447, 48.698281],
        [10.289986, 48.697996],
        [10.289565, 48.697781],
        [10.289091, 48.698008]
      ]]
    }
  },
  {
    name: "Haupttribüne - Dreieck",
    capacity: 4,
    area: {
      type: "Polygon",
      coordinates: [[
        [10.290779, 48.696516],
        [10.290297, 48.696800],
        [10.290514, 48.696966],
        [10.291104, 48.696640],
        [10.290779, 48.696516]
      ]]
    }
  }
]);

// Insert visitor tracking data
db.locations.insertMany([
  {
    userId: "besucher5",
    role: "visitor",
    latitude: 48.698200,
    longitude: 10.289350
  },
  {
    userId: "besucher4",
    role: "visitor",
    latitude: 48.698240,
    longitude: 10.289370
  },
  {
    userId: "besucher9",
    role: "Besucher",
    latitude: 48.698280,
    longitude: 10.289370
  },
  {
    userId: "besucher2",
    role: "visitor",
    latitude: 48.698210,
    longitude: 10.289360
  },
  {
    userId: "test3",
    role: "visitor",
    latitude: 48.697996,
    longitude: 10.290779
  },
  {
    userId: "tesetw21ddddseerrdsss9",
    role: "visitor",
    latitude: 48.698000,
    longitude: 10.289447
  },
  {
    userId: "besucher11",
    role: "Besucher",
    latitude: 48.699000,
    longitude: 10.290000
  },
  {
    userId: "besucher10",
    role: "Besucher",
    latitude: 48.698290,
    longitude: 10.289355
  }
]);

// Insert staff tracking data
db.locations.insertMany([
  {
    userId: "sanitaeter1",
    role: "Sanitäter",
    latitude: 48.69705,
    longitude: 10.29035
  },
  {
    userId: "sanitaeter2",
    role: "Sanitäter",
    latitude: 48.698220,
    longitude: 10.289370
  },
  {
    userId: "security1",
    role: "Security",
    latitude: 48.69715,
    longitude: 10.29040
  },
  {
    userId: "security2",
    role: "Security",
    latitude: 48.69700,
    longitude: 10.29030
  },
  {
    userId: "standbetreiber1",
    role: "Standbetreiber",
    latitude: 48.69720,
    longitude: 10.29050
  },
  {
    userId: "standbetreiber2",
    role: "Standbetreiber",
    latitude: 48.69705,
    longitude: 10.29055
  },
  {
    userId: "eventveranstalter1",
    role: "Eventveranstalter",
    latitude: 48.69710,
    longitude: 10.29040
  }
]);

// Insert visitor authentication data
db.visitors.insertMany([
  {
    userId: "standbetreiberUser123",
    role: "Standbetreiber",
    password: "deinPasswort"
  },
  {
    userId: "sani1",
    role: "Security",
    password: "deinPasswort"
  },
  {
    userId: "securityUser123",
    role: "Security",
    password: "deinPasswort"
  },
  {
    userId: "organizer1",
    role: "Eventveranstalter",
    password: "deinPaswort"
  }
]);

// Create sample emergency data
db.emergencies.insertMany([
  {
    lat: 48.6977,
    lng: 10.28909,
    timestamp: "2023-03-29T20:34:56Z"
  }
]);

// Create indexes for better query performance
db.locations.createIndex({ userId: 1 });
db.locations.createIndex({ role: 1 });
db.locations.createIndex({ "latitude": 1, "longitude": 1 });
db.zones.createIndex({ "area": "2dsphere" });
db.emergencies.createIndex({ timestamp: 1 });
db.emergencies.createIndex({ "lat": 1, "lng": 1 });
db.visitors.createIndex({ userId: 1 }, { unique: true });
db.visitors.createIndex({ role: 1 });
db.incidents.createIndex({ timestamp: 1 });

print('Database initialization completed');