// src/app/components/tracking/tracking.component.ts
import { Component, OnInit } from '@angular/core';
import { TrackingService } from './tracking.service';
// Passe den Pfad an, falls die Heatmap-Komponente in einem anderen Ordner liegt:
import { HeatmapComponent } from '../heatmap/heatmap.component';

@Component({
  standalone: true,
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
  // Hier fügst du die Heatmap-Komponente hinzu, damit Angular sie kennt:
  imports: [HeatmapComponent]
})
export class TrackingComponent implements OnInit {
  userId = 'user123';
  role = 'visitor';

  constructor(private trackingService: TrackingService) {}

  ngOnInit() {
    // Jede Minute den Standort abrufen und senden
    setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.trackingService.sendLocation(this.userId, this.role, lat, lng)
            .subscribe(
              () => console.log('Standort gesendet'),
              err => console.error('Fehler beim Senden:', err)
            );
        },
        err => console.error('GPS-Fehler', err),
        { enableHighAccuracy: true }
      );
    }, 60000); // 60 Sekunden
  }
}
