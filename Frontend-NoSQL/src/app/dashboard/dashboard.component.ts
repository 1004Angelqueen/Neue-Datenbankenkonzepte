import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../components/Navigation/navigation.component';
import { HeatmapComponent } from '../components/heatmap/heatmap.component';
import { NotificationComponent } from '../components/notification/notification.component';
import { ZoneService, ZoneStatus } from '../services/zone.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-wrapper">
      <app-notification></app-notification>
      <app-navigation></app-navigation>
      
      <div class="dashboard-content">
        <h2>Dashboard</h2>
        
        <!-- Zone Status Panel -->
        <div class="zone-status-panel">
          <mat-card *ngFor="let zone of zoneStatus" 
                    class="zone-card"
                    [ngClass]="zone.type">
            <mat-card-content>
              <div class="zone-info">
                <strong>{{ zone.zone }}</strong>
                <span class="visitor-count">
                  {{ zone.currentVisitors }} / {{ zone.capacity }}
                </span>
              </div>
              <div class="update-time" *ngIf="zone.timestamp">
                Letztes Update: {{ formatTime(zone.timestamp) }}
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="heatmap-container">
          <app-heatmap></app-heatmap>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      width: 100%;
      height: 100%;
    }
    .dashboard-content {
      padding: 20px;
    }
    .heatmap-container {
      margin-top: 20px;
    }
    .zone-status-panel {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1000;
      width: 250px;
    }
    .zone-card {
      margin-bottom: 8px;
      transition: all 0.3s ease;
    }
    .zone-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .visitor-count {
      font-weight: 500;
    }
    .update-time {
      font-size: 0.8em;
      color: #666;
      margin-top: 4px;
    }
    .normal {
      background-color: #e8f5e9;
    }
    .half {
      background-color: #fff3e0;
    }
    .full {
      background-color: #ffebee;
    }
  `],
  imports: [
    CommonModule,
    NavigationComponent,
    HeatmapComponent,
    NotificationComponent,
    MatCardModule
  ]
})
export class DashboardComponent {
  zoneStatus: ZoneStatus[] = [];

  constructor(private zoneService: ZoneService) {
    this.zoneService.getZoneStatus().subscribe(status => {
      this.zoneStatus = status;
    });
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}