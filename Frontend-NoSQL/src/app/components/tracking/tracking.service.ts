import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private apiUrl = 'http://localhost:3000/api/track';

  constructor(private http: HttpClient) {}

  sendLocation(userId: string, role: string, latitude: number, longitude: number) {
    return this.http.post(this.apiUrl, {
      userId,
      role,
      latitude,
      longitude
    });
  }
}
