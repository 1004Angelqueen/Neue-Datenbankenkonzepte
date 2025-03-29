import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyButtonComponent } from './emergency-button.component';

describe('EmergencyButtonComponent', () => {
  let component: EmergencyButtonComponent;
  let fixture: ComponentFixture<EmergencyButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
