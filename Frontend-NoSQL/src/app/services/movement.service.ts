import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  moveVisitors(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/move-visitors-continuous`, {});
  }
}
