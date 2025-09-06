import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../models/app.models';
import { buildPatch } from '../../../adapters/patch-utils';
import { MetaDataResponse } from '../../../models/MetaDataResponse';

@Component({
  selector: 'user-religious-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-religious-details.component.html'
})
export class UserReligiousDetailsComponent {
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
      religion: [''],
      caste: [''],
      subcaste: [''],
      gothram: [''],
      star: [''],
      rasi: ['']
    });
  }

  ngOnChanges() {
    if (this.user) this.form.patchValue({
      religion: this.user.religion,
      caste: this.user.caste,
      subcaste: this.user.subcaste,
      gothram: this.user.gothram,
      star: this.user.star,
      rasi: this.user.rasi
    });
  }

  onEdit() { this.enterEdit.emit(); }

  onCancel() {
    if (this.user) this.form.patchValue({
      religion: this.user.religion,
      caste: this.user.caste,
      subcaste: this.user.subcaste,
      gothram: this.user.gothram,
      star: this.user.star,
      rasi: this.user.rasi
    });
    this.cancelEdit.emit();
  }

  onSave() {
    const patch = buildPatch<UserProfile>(this.user, this.form.value);
    if (Object.keys(patch).length === 0) { this.cancelEdit.emit(); return; }
    this.save.emit(patch);
  }
}
