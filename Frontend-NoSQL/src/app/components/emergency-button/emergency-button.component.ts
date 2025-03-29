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
  constructor(private emergencyService: EmergencyService) {}

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
