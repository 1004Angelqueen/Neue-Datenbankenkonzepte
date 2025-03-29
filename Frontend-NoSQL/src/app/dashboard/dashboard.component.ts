import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../components/Navigation/navigation.component';
import { HeatmapComponent } from '../components/heatmap/heatmap.component';
import { IncidentsComponent } from '../components/incidents/incidents.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  template: `
    <app-navigation></app-navigation>
    <div class="dashboard-content">
      <h2>Dashboard</h2>
      <!-- Hier kannst du deine Karte oder Heatmap einbinden -->
      <app-heatmap></app-heatmap>
      <app-incidents></app-incidents>

    </div>
  `,
  styles: [`
    .dashboard-content {
      padding: 1rem;
    }
  `],
  imports: [CommonModule, NavigationComponent, HeatmapComponent,IncidentsComponent]
})
export class DashboardComponent {}
