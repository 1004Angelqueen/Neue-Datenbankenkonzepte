// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/Login/Login.component' // Importiere den LoginComponent
import { DashboardComponent } from './dashboard/dashboard.component'; // Importiere den DashboardComponent

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent }
];