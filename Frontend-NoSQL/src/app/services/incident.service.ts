import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Incident {
  _id: string;
  zone: string;
  message: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Alle Incidents abrufen
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents`);
  }

  // Incident anhand der _id löschen
  deleteIncident(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/incidents/${id}`);
  }
}
