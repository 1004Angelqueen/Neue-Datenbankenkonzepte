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
  // Hier wird die Berechtigung geprüft, z. B. aus Local Storage
  isAdminOrSecurity: boolean = false;

  constructor(private emergencyService: EmergencyService) {
    // Rolle aus dem Local Storage auslesen
    const role = localStorage.getItem('role');
    this.isAdminOrSecurity = (role === 'admin' || role === 'security');
  }

  reportEmergency() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const incidentData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          };

          this.emergencyService.reportEmergency(incidentData)
            .subscribe(
              (response: any) => {
                // Marker nur anzeigen, wenn Admin/Security berechtigt sind
                if (this.isAdminOrSecurity) {
                  const map = (window as any)['map'];
                  if (!map) {
                    console.error("Kartenobjekt nicht gefunden!");
                    return;
                  }
                  const marker = L.marker([incidentData.lat, incidentData.lng]).addTo(map);
                  let popupContent = `<div>
                    <p><strong>Notfall gemeldet!</strong></p>
                    <p>Gemeldet am: ${new Date(incidentData.timestamp).toLocaleString()}</p>
                    <p>Koordinaten: ${incidentData.lat}, ${incidentData.lng}</p>
                    <button id="deleteBtn_${response.emergency._id}" style="background-color:red; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">
                      Löschen
                    </button>
                  </div>`;
                  marker.bindPopup(popupContent).openPopup();

                  marker.on('popupopen', () => {
                    const btn = document.getElementById(`deleteBtn_${response.emergency._id}`);
                    if (btn) {
                      btn.addEventListener('click', () => {
                        if (confirm('Möchten Sie diesen Notfall wirklich löschen?')) {
                          this.emergencyService.deleteEmergency(response.emergency._id).subscribe({
                            next: () => {
                              alert('Notfall wurde gelöscht');
                              map.removeLayer(marker);
                            },
                            error: (err) => {
                              console.error('Fehler beim Löschen des Incidents:', err);
                              alert('Löschen fehlgeschlagen');
                            }
                          });
                        }
                      });
                    }
                  });
                }
                // Optional: Benachrichtigung an alle, dass der Notfall gemeldet wurde
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
