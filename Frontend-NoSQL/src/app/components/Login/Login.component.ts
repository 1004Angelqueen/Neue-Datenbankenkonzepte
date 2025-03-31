import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent {
  visitorForm: FormGroup;
  adminForm: FormGroup;
  isVisitor: boolean = true;
  userRole: string = '';

  // Mapping von Benutzer-IDs zu Rollen
  private readonly userRoles: { [key: string]: string } = {
    'securityUser123': 'Security',
    'security2': 'Security',
    'organizer1': 'Eventveranstalter',
    'event2': 'Eventveranstalter',
    'sani1': 'Sanitäter',
    'sani2': 'Sanitäter',
    'standbetreiberUser123': 'Standbetreiber',
    'stand2': 'Standbetreiber'
  };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.visitorForm = this.fb.group({
      consent: [false, Validators.requiredTrue]
    });

    this.adminForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
      role: [{ value: '', disabled: true }] // Deaktiviertes Rollenfeld
    });

    // Überwache Änderungen der userId
    this.adminForm.get('userId')?.valueChanges.subscribe(userId => {
      this.updateUserRole(userId);
    });
  }

  // Aktualisiere die Rolle basierend auf der userId
  private updateUserRole(userId: string): void {
    const role = this.userRoles[userId];
    this.userRole = role || '';
    this.adminForm.patchValue({ role: this.userRole });
  }

  loginVisitor(): void {
    if (this.visitorForm.valid) {
      this.authService.loginVisitor().subscribe(
        data => {
          console.log('Besucher-Login erfolgreich:', data);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('role', 'Besucher');
          this.router.navigate(['/dashboard']);
        },
        err => console.error('Fehler beim Besucher-Login:', err)
      );
    }
  }

  loginAdmin(): void {
    if (this.adminForm.valid && this.userRole) {
      const credentials = {
        userId: this.adminForm.get('userId')?.value,
        password: this.adminForm.get('password')?.value,
        role: this.userRole
      };
      
      this.authService.loginAdmin(credentials).subscribe(
        data => {
          console.log('Admin-Login erfolgreich:', data);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', credentials.userId);
          localStorage.setItem('role', this.userRole);
          this.router.navigate(['/dashboard']);
        },
        err => console.error('Fehler beim Admin-Login:', err)
      );
    }
  }

  toggleLogin(): void {
    this.isVisitor = !this.isVisitor;
  }
}