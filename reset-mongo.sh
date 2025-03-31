#!/bin/bash
mongoimport --host mongo --db geoDB --collection brunoCollection --type json --file /docker-entrypoint-initdb.d/brunoCollection.json --jsonArray

# Lösche alle Daten im MongoDB-Datenverzeichnis
rm -rf /data/db/*
echo "Datenbank zurückgesetzt, Initialisierungsskripte werden ausgeführt..."
# Starte MongoDB, indem das Original-EntryPoint-Skript aufgerufen wird
exec /usr/local/bin/docker-entrypoint.sh mongod
