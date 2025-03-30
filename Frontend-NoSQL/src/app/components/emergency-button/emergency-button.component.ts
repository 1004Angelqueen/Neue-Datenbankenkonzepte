import { Component } from '@angular/core';
import { EmergencyService } from './emergency.service';
declare var L: any;

@Component({
  selector: 'app-emergency-button',
  standalone: true,
  templateUrl: './emergency-button.component.html',
  styleUrls: ['./emergency-button.component.css']
})
export class EmergencyButtonComponent {
  // Berechtigte Rollen: Eventveranstalter, Security, Sanitäter
  isAuthorized: boolean = false;

  constructor(private emergencyService: EmergencyService) {
    const role = localStorage.getItem('role');
    // Passe die Rollenbezeichnungen an, wie sie in deinem AuthService gespeichert sind.
    this.isAuthorized = (role === 'Eventveranstalter' || role === 'Security' || role === 'Sanitäter');
  }

  reportEmergency(): void {
    if (!navigator.geolocation) {
      alert("Geolocation wird von Ihrem Browser nicht unterstützt.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        let incidentData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };

        this.emergencyService.reportEmergency(incidentData)
          .subscribe({
            next: (response: any) => {
              // Falls das Backend den Zonennamen setzt, verwenden wir diesen, ansonsten "Unbekannt"
              let zoneName = response.emergency.zone || 'Unbekannt';

              if (this.isAuthorized) {
                let map = (window as any)['map'];
                if (!map) {
                  console.error("Kartenobjekt nicht gefunden!");
                  return;
                }

                // Definiere den Popup-Inhalt inklusive Zonennamen
                let popupContent = `
                  <div>
                    <p><strong>Notfall gemeldet!</strong></p>
                    <p>Zone: ${zoneName}</p>
                    <p>Gemeldet am: ${new Date(incidentData.timestamp).toLocaleString()}</p>
                    <p>Koordinaten: ${incidentData.lat.toFixed(3)}, ${incidentData.lng.toFixed(3)}</p>
                    <button id="dismissBtn_${response.emergency._id}" 
                      style="background-color:red; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">
                      Von Karte entfernen
                    </button>
                  </div>
                `;

                // Erstelle einen roten CircleMarker
                let marker = L.circleMarker([incidentData.lat, incidentData.lng], {
                  radius: 8,
                  color: 'red',
                  fillColor: 'red',
                  fillOpacity: 1
                }).addTo(map);

                // Binde das Popup an den Marker und öffne es sofort
                marker.bindPopup(popupContent).openPopup();

                // Verwende einen Timeout, um sicherzustellen, dass das Popup im DOM ist
                setTimeout(() => {
                  let btn = document.getElementById(`dismissBtn_${response.emergency._id}`);
                  console.log("Dismiss-Button Element:", btn);
                  if (btn) {
                    btn.addEventListener('click', () => {
                      if (confirm('Möchten Sie diesen Notfall wirklich von der Karte entfernen?')) {
                        map.removeLayer(marker);
                        alert('Notfall wurde von der Karte entfernt');
                      }
                    });
                  } else {
                    console.error("Dismiss-Button nicht gefunden!");
                  }
                }, 150);
              }
              alert("Notfall wurde erfolgreich gemeldet!");
            },
            error: (error) => {
              console.error("Fehler beim Senden der Notfallmeldung:", error);
            }
          });
      },
      (error) => {
        console.error("Fehler bei der Standortermittlung:", error);
      }
    );
  }
}
