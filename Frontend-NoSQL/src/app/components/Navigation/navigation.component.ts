// src/app/components/navigation/navigation.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { EmergencyButtonComponent } from './../emergency-button/emergency-button.component'; 

import { RouterLink } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-navigation',

  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  imports: [RouterLink, EmergencyButtonComponent] // Füge hier den RouterLink-Direktiv hinzu

})
export class NavigationComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
