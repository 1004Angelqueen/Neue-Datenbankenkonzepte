import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmergencyService {
  // Verwende hier entweder den Proxy ("/api/emergency") oder die vollständige URL (z. B. "http://localhost:3000/api/emergency")
  private emergencyUrl = 'http://localhost:3000/api/emergency';

  constructor(private http: HttpClient) {}

  reportEmergency(incidentData: any): Observable<any> {
    return this.http.post(this.emergencyUrl, incidentData);
  }
}
