FROM mongo:6.0

# Kopiere die Initialisierungsdatei
COPY init-mongo.js /docker-entrypoint-initdb.d/

# Setze Umgebungsvariablen
ENV MONGO_INITDB_DATABASE=eventDB

EXPOSE 27017

# Verwende den Standard MongoDB Entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mongod"]