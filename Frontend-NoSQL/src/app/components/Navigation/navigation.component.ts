import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { EmergencyButtonComponent } from '../emergency-button/emergency-button.component';
import { MoveVisitorsComponent } from '../move-visitors/move-visitors.component';


@Component({
  standalone: true,
  selector: 'app-navigation',

  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  imports: [RouterLink,CommonModule, EmergencyButtonComponent, MoveVisitorsComponent],
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