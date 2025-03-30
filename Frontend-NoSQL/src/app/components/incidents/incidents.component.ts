import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService, Incident, Emergency } from '../../services/incident.service';
import { NavigationComponent } from '../Navigation/navigation.component'; // <--- Navigation importieren

@Component({
  standalone: true,
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css'],
  imports: [CommonModule, NavigationComponent] // <--- Navigation importieren
})
export class IncidentsComponent implements OnInit {
  incidents: Incident[] = [];
  emergencys: Emergency[] = [];

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.incidentService.getIncidents().subscribe({
      next: data => this.incidents = data,
      error: err => console.error('Fehler beim Laden der Incidents:', err)
    });

    this.incidentService.getEmergencys().subscribe({
      next: data => this.emergencys = data,
      error: err => console.error('Fehler beim Laden der Incidents:', err)
    });
  }
}
