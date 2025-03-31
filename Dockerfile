FROM mongo:6.0

# Kopiere den Ordner mit deinen Initialisierungsdaten (z. B. deine Bruno Collection)
COPY ./initdb /docker-entrypoint-initdb.d/

# Kopiere das Reset-Skript in den Container
COPY reset-mongo.sh /usr/local/bin/reset-mongo.sh

# Setze Ausführungsrechte für das Skript
RUN chmod +x /usr/local/bin/reset-mongo.sh

# Setze das Reset-Skript als EntryPoint
ENTRYPOINT ["/usr/local/bin/reset-mongo.sh"]

EXPOSE 27017