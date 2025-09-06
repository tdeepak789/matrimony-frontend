import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfessionalDetailsComponent } from './user-professional-details.component';

describe('UserProfessionalDetailsComponent', () => {
  let component: UserProfessionalDetailsComponent;
  let fixture: ComponentFixture<UserProfessionalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfessionalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfessionalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
