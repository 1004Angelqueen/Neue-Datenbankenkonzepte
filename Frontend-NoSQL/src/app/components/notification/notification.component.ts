import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  standalone: true,
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  imports: [CommonModule]
})
export class NotificationComponent implements OnInit {
  notifications: string[] = [];

  constructor(private wsService: WebsocketService) {}

  ngOnInit(): void {
    this.wsService.getMessages().subscribe({
      next: (data) => {
        if (data.incident) {
          // Hole die aktuelle Rolle aus z. B. localStorage oder einem AuthService
          const role = localStorage.getItem('role');
          // Nur berechtigte Rollen (z. B. Security oder Eventveranstalter) erhalten Incidents
          if (role === 'Security' || role === 'Eventveranstalter') {
            const message = `Incident in Zone "${data.incident.zone}": ${data.incident.message}`;
            this.notifications.push(message);
            // Optional: Timeout, um die Benachrichtigung nach einiger Zeit zu entfernen
            setTimeout(() => {
              this.notifications = this.notifications.filter(n => n !== message);
            }, 5000);
          }
        }
      },
      error: (err) => console.error('WebSocket Fehler:', err)
    });
  }
}
