# Verwende das offizielle MongoDB-Image als Basis
FROM mongo:6.0

# Kopiere den initdb-Ordner in das offizielle Initialisierungsverzeichnis
COPY ./initdb /docker-entrypoint-initdb.d/

# Standardmäßig wird der Container auf Port 27017 lauschen
EXPOSE 27017
