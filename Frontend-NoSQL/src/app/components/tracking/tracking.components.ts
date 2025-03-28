import { Component, OnInit } from '@angular/core';
import { TrackingService } from './tracking.service';

@Component({
  standalone: true,
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  userId = 'user123';
  role = 'visitor';

  constructor(private trackingService: TrackingService) {}

  ngOnInit() {
    // Jede Minute den aktuellen Standort abrufen und senden
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
    }, 60000); // alle 60 Sekunden
  }
}
