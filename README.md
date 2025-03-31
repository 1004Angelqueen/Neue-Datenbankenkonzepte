````markdown
# Neue-Datenbankenkonzepte

Installation 

Allgemein

Dieses Projekt benötigt folgende Software um ausgeführt zu werden: 

- Docker (Version: [bitte Version einfügen])
- Node (Version: [bitte Version einfügen])

Diese Versionen wurden zum Entwickeln verwendet, es kann sein, dass das Projekt auch mit anderen
Versionen funktioniert.

# Frontend
Das Frontend ist mithilfe von Angular realisiert. Installiert wird es, indem in dem frontend-Ordner folgender
Befehl ausgeführt wird:

```bash
npm install
```

Um das Frontend anzusprechen muss folgender Befehl ausgeführt werden, falls noch nicht automatisch: 

```bash
cd Frontend-NoSQL
```

Danach wie beschrieben den Installationsbefehl ausführen.

Das Frontend wird mit dem folgenden Befehl gestartet: 

```bash
ng serve
```

# Backend

Das Backend ist mithilfe von Node.js realisiert. Die Dependencies werden in dem backend-Ordner wie folgt
installiert:

```bash
npm install
```

Um die benötigte MongoDB-Datenbank in einem Docker Container zu installieren und zu starten, wird folgender
Befehl ausgeführt:

```bash
docker-compose up -d
```

Gestartet werden kann das Backend mit dem Befehl:

```bash
node index.js
```
