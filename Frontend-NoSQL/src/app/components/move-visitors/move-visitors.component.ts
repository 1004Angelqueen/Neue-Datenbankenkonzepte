import { Component, OnDestroy, OnInit } from '@angular/core';
import { MovementService } from '../../services/movement.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-move-visitors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="startMovement()" [disabled]="movementActive">Bewegung starten</button>
    <button (click)="stopMovement()" [disabled]="!movementActive">Bewegung stoppen</button>
    <p *ngIf="message">{{ message }}</p>
  `,
  styles: [`
    button { margin-right: 10px; }
  `]
})
export class MoveVisitorsComponent implements OnInit, OnDestroy {
  movementActive = false;
  message = '';
  private movementSub!: Subscription;

  constructor(private movementService: MovementService) {}

  ngOnInit(): void {}

  startMovement(): void {
    if (!this.movementActive) {
      this.movementActive = true;
      this.message = 'Bewegung läuft...';
      this.movementSub = interval(1000).pipe(
        switchMap(() => this.movementService.moveVisitors())
      ).subscribe({
        next: (res: any) => {
          this.message = res.message;
        },
        error: (err) => {
          console.error('Fehler beim Bewegen der Besucher:', err);
          this.message = 'Fehler beim Bewegen der Besucher';
        }
      });
    }
  }

  stopMovement(): void {
    if (this.movementActive) {
      this.movementActive = false;
      if (this.movementSub) {
        this.movementSub.unsubscribe();
      }
      this.message = 'Bewegung gestoppt';
    }
  }

  ngOnDestroy(): void {
    if (this.movementSub) {
      this.movementSub.unsubscribe();
    }
  }
}
