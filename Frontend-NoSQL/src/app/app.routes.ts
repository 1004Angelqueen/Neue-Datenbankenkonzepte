// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/Login/Login.component' // Importiere den LoginComponent
import { DashboardComponent } from './dashboard/dashboard.component'; // Importiere den DashboardComponent
import { IncidentsComponent } from './components/incidents/incidents.component';
import { RoleGuard } from './guards/role.guard';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'incidents',
    component: IncidentsComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: ['Eventveranstalter', 'Security', 'Sanitäter', 'Standbetreiber'] }
  }
];