// src/app/components/incidents/incidents.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService, Incident } from '../../services/incident.service';

@Component({
  standalone: true,
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css'],
  imports: [CommonModule]
})
export class IncidentsComponent implements OnInit {
  incidents: Incident[] = [];

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.incidentService.getIncidents().subscribe(
      (data) => {
        this.incidents = data;
      },
      (err) => console.error('Fehler beim Laden der Incidents:', err)
    );
  }
}
