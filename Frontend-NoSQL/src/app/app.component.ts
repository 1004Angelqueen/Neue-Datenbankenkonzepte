import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingComponent } from './components/tracking/tracking.components';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, RouterOutlet]
})
export class AppComponent {
  title = 'Frontend-NoSQL';
}
/*export class AppComponent implements OnInit, OnDestroy {
  title = 'Frontend-NoSQL';
  private wsSubscription?: Subscription;
  private reloadTimeout: any = null;

  constructor(private wsService: WebsocketService) {}

  ngOnInit() {
    // Subscribe to WebSocket messages at the app level
    this.wsSubscription = this.wsService.getMessages().subscribe({
      next: (data) => {
        console.log('App Component: Neue WebSocket-Daten empfangen:', data);
        
        // Verzögerte Reload-Funktion
        if (this.reloadTimeout) {
          clearTimeout(this.reloadTimeout);
        }
        
        // Warte 2 Sekunden, bevor die Seite neu geladen wird
        this.reloadTimeout = setTimeout(() => {
          console.log('App Component: Lade Seite neu...');
          window.location.reload();
        }, 2000);
      },
      error: (err) => console.error('App Component: WebSocket Fehler:', err)
    });
  }

  ngOnDestroy() {
    // Cleanup
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout);
    }
  }
}*/