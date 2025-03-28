import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingComponent } from './components/tracking/tracking.components';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // Hier importieren wir alle Komponenten und Direktiven, die im Template genutzt werden.
  imports: [
    CommonModule,
    TrackingComponent,
    RouterOutlet
  ]
})
export class AppComponent {
  title = 'Frontend-NoSQL';
}