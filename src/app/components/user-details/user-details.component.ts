import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserserviceService } from '../../services/userservice.service';
import { UserProfile } from '../../models/app.models';
import { ActivatedRoute, Router } from '@angular/router';

import { UserBasicDetailsComponent } from './user-basic-details/user-basic-details.component';
import { UserReligiousDetailsComponent } from './user-religious-details/user-religious-details.component';
import { UserProfessionalDetailsComponent } from './user-professional-details/user-professional-details.component';
import {  UserAddressDetailsComponent  } from './user-address-details/user-address-details.component';
import { MetaDataResponse } from '../../models/MetaDataResponse';
import { AuthService } from '../../auth.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    UserBasicDetailsComponent,
    UserReligiousDetailsComponent,
    UserProfessionalDetailsComponent,
    UserAddressDetailsComponent
  ],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  user: UserProfile | null = null;
  // which section currently being edited (key names: 'basic','religious','professional','address')
  editSection: string | null = null;
  metaOptions: MetaDataResponse = {} as MetaDataResponse;
  constructor(
    private userService: UserserviceService,
    private route: ActivatedRoute,
    private router: Router,
    private auth:AuthService
  ) {}

  ngOnInit() {
    // support loading by route param userId OR fetch current user
    const idFromRoute = this.route.snapshot.paramMap.get('userId');
    if (idFromRoute) {
      const id = Number(idFromRoute);
      this.userService.getUserProfileById(id).subscribe({ next: u => this.user = u });
    } 

     this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = Number(params.get('userId'));
          return this.userService.getUserProfileById(id);
        })
      )
      .subscribe({
        next: user => this.user = user,
        error: err => console.error(err)
      });
    // else {
    //   this.userService.getCurrentUser().subscribe({ next: u => this.user = u });
    // }
    this.userService.getMetaData().subscribe({
      next: meta => this.metaOptions = meta,
      error: err => console.error(err)
    });
  }

  startEdit(section: string) { this.editSection = section; }
  cancelEdit() { this.editSection = null; }

  // children emit Partial<UserProfile> containing only changed fields
  saveSection(patch: Partial<UserProfile>) {
    if (!this.user) return;
    const merged: UserProfile = { ...this.user, ...patch };

    // id is required as per your model
    this.userService.updateUserProfile(merged.id, merged).subscribe({
      next: updated => {
        this.user = updated;
        this.editSection = null;
      },
      error: err => {
        console.error('Update failed', err);
        // optionally show toast / error message
      }
    });
  }

  // photo upload helpers
  selectedFiles: File[] = [];
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    if (files.length > 3) { alert('Max 3 photos'); return; }
    this.selectedFiles = files;
  }

  onPhotoSubmit() {
    if (!this.user || this.selectedFiles.length === 0) return;
    this.userService.uploadUserPhotos(this.selectedFiles, this.user.id).subscribe({
      next: () => {
        alert('Uploaded');
        // refresh user or images if needed
      },
      error: err => console.error(err)
    });
  }

  deleteUser() {
    if (!this.user) return;
    if (!confirm('Delete user?')) return;
    this.userService.deleteUserProfile(this.user.id).subscribe({
      next: () => this.router.navigate(['/user-list']),
      error: err => console.error(err)
    });
  }

  canEdit(profileUserId: number): boolean {
    const currentUserId = this.auth.getUserId();
    return this.auth.isAdmin() || currentUserId === profileUserId;
  }

}
