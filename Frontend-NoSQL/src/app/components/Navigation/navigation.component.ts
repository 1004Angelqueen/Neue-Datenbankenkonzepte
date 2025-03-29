import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-navigation',
  template: `
    <nav class="nav-container">
      <ul>
        <li><a routerLink="/dashboard">Dashboard</a></li>
        <li><button (click)="logout()">Logout</button></li>
      </ul>
    </nav>
  `,
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
