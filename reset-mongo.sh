#!/bin/bash
# Rekursiv durch das initdb-Verzeichnis gehen und alle JSON-Dateien importieren
find /docker-entrypoint-initdb.d/ -type f -name "*.json" | while read file; do
  # Datei importieren
  echo "Importing $file into MongoDB"
  mongoimport --host mongo --db geoDB --collection brunoCollection --type json --file "$file" --jsonArray
done

# Führe den MongoDB-Daemon aus
mongod --bind_ip_all