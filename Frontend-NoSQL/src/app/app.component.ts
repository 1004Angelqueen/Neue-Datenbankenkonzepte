import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingComponent } from './components/tracking/tracking.components';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { NotificationComponent } from './components/notification/notification.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <app-notification></app-notification>
    <router-outlet></router-outlet>
    <!-- Rest deiner App-Komponenten -->
  `,
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule, 
    RouterOutlet,
    NotificationComponent,
    MatSnackBarModule
  ]
})
export class AppComponent {
  title = 'Frontend-NoSQL';
}