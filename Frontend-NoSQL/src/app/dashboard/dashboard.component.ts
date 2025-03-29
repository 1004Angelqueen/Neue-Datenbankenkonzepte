import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../components/Navigation/navigation.component';
import { HeatmapComponent } from '../components/heatmap/heatmap.component';
@Component({
  standalone: true,
  selector: 'app-dashboard',
  template: `
    <app-navigation></app-navigation>
    <div class="dashboard-content">
      <h2>Dashboard</h2>
      <!-- Hier kannst du deine Karte oder Heatmap einbinden -->
      <app-heatmap></app-heatmap>
    </div>
  `,
  imports: [CommonModule, NavigationComponent, HeatmapComponent]
})
export class DashboardComponent {}
