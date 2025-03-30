import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-navigation',
  template: `
    <nav class="nav-container">
      <ul>
        <li><a routerLink="/dashboard">Dashboard</a></li>
        <li *ngIf="shouldShowIncidents()">
          <a routerLink="/incidents">Incidents</a>
        </li>
        <li><button (click)="logout()">Logout</button></li>
      </ul>
    </nav>
  `,
  styleUrls: ['./navigation.component.css'],
  imports: [RouterLink, CommonModule]
})
export class NavigationComponent {
  // Rollen, die den Zugriff auf die Incidents erlauben
  private allowedRoles = ['Eventveranstalter', 'Security', 'Sanitäter', 'Standbetreiber'];

  constructor(private authService: AuthService, private router: Router) {}

  shouldShowIncidents(): boolean {
    const role = localStorage.getItem('role');
    return role ? this.allowedRoles.includes(role) : false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}