#!/bin/bash
# Lösche existierende Datenbank
mongosh --eval "db.getSiblingDB('eventDB').dropDatabase()"

# Führe Initialisierungsskript aus
mongosh eventDB /docker-entrypoint-initdb.d/init-mongo.js

# Starte normalen MongoDB-Prozess
exec docker-entrypoint.sh mongod