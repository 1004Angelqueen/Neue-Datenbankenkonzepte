// src/app/components/login/login.component.ts
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
  // Visitor-Form: nur Consent wird abgefragt
  visitorForm: FormGroup;
  // Admin-Form: benötigt userId, password und role
  adminForm: FormGroup;
  // Toggle zwischen Besucher- und Admin-Login
  isVisitor: boolean = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.visitorForm = this.fb.group({
      consent: [false, Validators.requiredTrue]
    });

    this.adminForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  // Besucher-Login
  loginVisitor(): void {
    if (this.visitorForm.valid) {
      this.authService.loginVisitor().subscribe(
        data => {
          console.log('Besucher-Login erfolgreich:', data);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('role', data.role);
          this.router.navigate(['/dashboard']); // Passe an, wohin navigiert werden soll
        },
        err => console.error('Fehler beim Besucher-Login:', err)
      );
    }
  }

  // Admin-Login
  loginAdmin(): void {
    if (this.adminForm.valid) {
      const credentials = this.adminForm.value;
      this.authService.loginAdmin(credentials).subscribe(
        data => {
          console.log('Admin-Login erfolgreich:', data);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('role', data.role);
          this.router.navigate(['/dashboard']);
        },
        err => console.error('Fehler beim Admin-Login:', err)
      );
    }
  }

  // Umschalten zwischen den Login-Modi
  toggleLogin(): void {
    this.isVisitor = !this.isVisitor;
  }
}
