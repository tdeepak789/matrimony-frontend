import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReligiousDetailsComponent } from './user-religious-details.component';

describe('UserReligiousDetailsComponent', () => {
  let component: UserReligiousDetailsComponent;
  let fixture: ComponentFixture<UserReligiousDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReligiousDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserReligiousDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
