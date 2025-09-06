import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../models/app.models';
import { buildPatch } from '../../../adapters/patch-utils';
import { MetaDataResponse } from '../../../models/MetaDataResponse';

@Component({
  selector: 'user-basic-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-basic-details.component.html'
})
export class UserBasicDetailsComponent {
  @Input() user!: UserProfile;
  @Input() editing = false;
  @Input() metaOptions!: MetaDataResponse;
  @Input() canEdit = false; 
  
  @Output() enterEdit = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<UserProfile>>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: [''],
      gender: [''],
      height: [0, [Validators.min(0)]],
      bio: [''],
      maritalStatus: [''],
      motherTongue: [''],
      email: ['', [Validators.email]],
      phoneNumber: [0]
    });
  }

  ngOnChanges() {
    if (this.user) this.form.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      dateOfBirth: this.user.dateOfBirth,
      gender: this.user.gender,
      height: this.user.height,
      bio: this.user.bio,
      maritalStatus: this.user.maritalStatus,
      motherTongue: this.user.motherTongue,
      email: this.user.email,
      phoneNumber: this.user.phoneNumber
    });
  }

  onEdit() { this.enterEdit.emit(); }

  onCancel() {
    this.form.reset();
    if (this.user) this.form.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      dateOfBirth: this.user.dateOfBirth,
      gender: this.user.gender,
      height: this.user.height,
      bio: this.user.bio,
      maritalStatus: this.user.maritalStatus,
      motherTongue: this.user.motherTongue,
      email: this.user.email,
      phoneNumber: this.user.phoneNumber
    });
    this.cancelEdit.emit();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // compute changed fields only
    const patch = buildPatch<UserProfile>(this.user, this.form.value);
    if (Object.keys(patch).length === 0) {
      // nothing changed
      this.cancelEdit.emit();
      return;
    }
    this.save.emit(patch);
  }
}
