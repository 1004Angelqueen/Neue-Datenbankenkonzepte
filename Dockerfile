FROM mongo:6.0

# Kopiere die Initialisierungsdatei und das Reset-Skript
COPY init-mongo.js /docker-entrypoint-initdb.d/
COPY reset-mongo.sh /usr/local/bin/

# Setze Ausführungsrechte für das Reset-Skript
RUN chmod +x /usr/local/bin/reset-mongo.sh

# Setze Umgebungsvariablen
ENV MONGO_INITDB_DATABASE=eventDB

EXPOSE 27017

# Verwende das Reset-Skript als Entrypoint
ENTRYPOINT ["/usr/local/bin/reset-mongo.sh"]