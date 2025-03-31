FROM mongo:6.0

# Kopiere die Initialisierungsdatei
COPY init-mongo.js /docker-entrypoint-initdb.d/

# Setze Umgebungsvariablen
ENV MONGO_INITDB_DATABASE=eventDB

# Setze Berechtigungen für das Init-Script
RUN chmod 755 /docker-entrypoint-initdb.d/init-mongo.js

EXPOSE 27017

# Verwende den Standard MongoDB Entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mongod"]