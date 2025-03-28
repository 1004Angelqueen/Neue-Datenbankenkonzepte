use("geoDB");  // Wechselt (bzw. erstellt) die Datenbank "geoDB"

// Erstes Dokument in die Collection "locations" einfügen
db.locations.insertOne({
  name: "Erster Ort",
  location: {
    type: "Point",
    coordinates: [ 13.405, 52.52 ]  // Beispiel: Berlin (Längengrad, Breitengrad)
  }
});
