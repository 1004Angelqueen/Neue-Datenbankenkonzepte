import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveVisitorsComponent } from './move-visitors.component';

describe('MoveVisitorsComponent', () => {
  let component: MoveVisitorsComponent;
  let fixture: ComponentFixture<MoveVisitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveVisitorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveVisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
