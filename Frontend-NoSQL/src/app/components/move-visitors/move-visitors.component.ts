import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovementService } from '../../services/movement.service';

@Component({
  selector: 'app-movement',
  templateUrl:'move-visitors.component.html',
  standalone: true,
  imports: [CommonModule],
  
})
export class MovementComponent {
  isMoving = false;
  isError = false;
  message = '';

  constructor(private movementService: MovementService) {}

  startMovement() {
    this.isMoving = true;
    this.isError = false;
    this.message = 'Starte Bewegung...';
    
    this.movementService.moveVisitors().subscribe({
      next: (response) => {
        console.log('Bewegung gestartet:', response);
        this.message = response.message;
      },
      error: (error) => {
        console.error('Fehler beim Starten der Bewegung:', error);
        this.isMoving = false;
        this.isError = true;
        this.message = 'Fehler beim Starten der Bewegung: ' + 
          (error.error?.message || error.message || 'Unbekannter Fehler');
      }
    });
  }

  stopMovement() {
    this.movementService.stopMovement().subscribe({
      next: (response) => {
        this.isMoving = false;
        this.isError = false;
        this.message = response.message;
      },
      error: (error) => {
        this.isError = true;
        this.message = 'Fehler beim Stoppen der Bewegung: ' + 
          (error.error?.message || error.message || 'Unbekannter Fehler');
      }
    });
  }
}