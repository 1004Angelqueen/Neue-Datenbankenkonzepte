import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Daten für den Export sammeln
  exportEventData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/export-data`);
  }
}