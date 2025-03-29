import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Falls du Leaflet verwendest, kannst du es entweder über npm installieren und importieren oder global einbinden
// Beispiel: import * as L from 'leaflet'; 
declare var L: any;  // falls Leaflet global eingebunden ist

@Component({
  selector: 'app-emergency-button',
  templateUrl: './emergency-button.component.html',
  styleUrls: ['./emergency-button.component.css']
})
export class EmergencyButtonComponent {
  // Hier muss dein Karten-Objekt referenziert werden (z.B. wenn du eine Karte in einer anderen Komponente initialisierst)
  // Für dieses Beispiel gehen wir davon aus, dass 'map' global verfügbar ist oder du es anderweitig injizierst.
  
  constructor(private http: HttpClient) {}

  reportEmergency() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const incidentData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          };
  
          this.http.post('/api/emergency', incidentData)
            .subscribe(
              (response: any) => {
                // Hole die Karte über window
                const map = (window as any)['map'];

                if (!map) {
                  console.error("Kartenobjekt nicht gefunden!");
                  return;
                }
                const marker = L.marker([incidentData.lat, incidentData.lng]).addTo(map);
                marker.bindPopup("Notfall gemeldet!").openPopup();
                alert("Notfall wurde erfolgreich gemeldet!");
              },
              (error) => {
                console.error("Fehler beim Senden der Notfallmeldung:", error);
              }
            );
        },
        (error) => {
          console.error("Fehler bei der Standortermittlung:", error);
        }
      );
    } else {
      alert("Geolocation wird von Ihrem Browser nicht unterstützt.");
    }
  }
}  