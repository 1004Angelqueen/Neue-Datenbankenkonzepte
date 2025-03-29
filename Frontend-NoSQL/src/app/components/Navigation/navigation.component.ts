import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-navigation',
  template: `
    <nav class="nav-container">
      <ul>
        <li><a routerLink="/dashboard">Dashboard</a></li>
        <!-- Zeige den Incidents-Link nur, wenn die Rolle nicht 'Besucher' ist -->
        <li *ngIf="shouldShowIncidents()">
          <button [routerLink]="['/incidents']">Incidents</button>
        </li>
        <li><button (click)="logout()">Logout</button></li>
      </ul>
    </nav>
  `,
  styleUrls: ['./navigation.component.css'],
  imports: [RouterLink,CommonModule]
})
export class NavigationComponent {
  // Rollen, die den Zugriff auf die Incidents erlauben
  allowedRoles = ['Eventveranstalter', 'Security', 'Sanitäter', 'Standbetreiber'];

  constructor(private authService: AuthService, private router: Router) {}

  shouldShowIncidents(): boolean {
    // Hole die Rolle aus dem Local Storage (oder alternativ vom AuthService)
    const role = localStorage.getItem('role');
    return role ? this.allowedRoles.includes(role) : false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
