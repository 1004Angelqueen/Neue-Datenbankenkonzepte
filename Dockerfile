FROM mongo:6.0

# Kopiere die Initialisierungsdatei
COPY init-mongo.js /docker-entrypoint-initdb.d/

# Erstelle das Reset-Script direkt im Dockerfile
RUN echo '#!/bin/bash\n\
mongosh --eval "db.getSiblingDB(\"eventDB\").dropDatabase()"\n\
mongosh eventDB /docker-entrypoint-initdb.d/init-mongo.js\n\
exec docker-entrypoint.sh mongod' > /usr/local/bin/reset-mongo.sh && \
    chmod +x /usr/local/bin/reset-mongo.sh

ENV MONGO_INITDB_DATABASE=eventDB

# Setze das Reset-Skript als EntryPoint
ENTRYPOINT ["/usr/local/bin/reset-mongo.sh"]

EXPOSE 27017