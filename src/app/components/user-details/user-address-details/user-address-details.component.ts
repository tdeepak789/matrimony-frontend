import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../models/app.models';
import { buildPatch } from '../../../adapters/patch-utils';
import { MetaDataResponse } from '../../../models/MetaDataResponse';

@Component({
  selector: 'user-address-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-address-details.component.html'
})
export class UserAddressDetailsComponent {
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
      country: [''],
      state: [''],
      city: ['']
    });
  }

  ngOnChanges() {
    if (this.user) this.form.patchValue({
      country: this.user.country,
      state: this.user.state,
      city: this.user.city
    });
  }

  onEdit() { this.enterEdit.emit(); }

  onCancel() {
    if (this.user) this.form.patchValue({
      country: this.user.country,
      state: this.user.state,
      city: this.user.city
    });
    this.cancelEdit.emit();
  }

  onSave() {
    const patch = buildPatch<UserProfile>(this.user, this.form.value);
    if (Object.keys(patch).length === 0) { this.cancelEdit.emit(); return; }
    this.save.emit(patch);
  }
}
