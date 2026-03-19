import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, filter, map, switchMap, takeUntil } from 'rxjs';

import { UserserviceService } from '../../services/userservice.service';
import { AuthService } from '../../auth.service';
import { UserPhoto, UserProfile } from '../../models/app.models';
import { MetaDataResponse } from '../../models/MetaDataResponse';

import { UserBasicDetailsComponent } from './user-basic-details/user-basic-details.component';
import { UserReligiousDetailsComponent } from './user-religious-details/user-religious-details.component';
import { UserProfessionalDetailsComponent } from './user-professional-details/user-professional-details.component';
import { UserAddressDetailsComponent } from './user-address-details/user-address-details.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PhotoUploadMaxSizeBytes, PhotoUploadMaxSizeMB } from '../../models/constants';

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
export class UserDetailsComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  photos: UserPhoto[] = [];
  activePhotoIndex: number = 0;
  showPhotoActions: boolean = false;
  showDeleteConfirmation: boolean = false;
  selectedFiles: File[] = [];
  selectedFilePreviews: { fileName: string; url: string }[] = [];
  isUploadingPhotos: boolean = false;
  isReorderingPhotos: boolean = false;
  dragSourceIndex: number | null = null;
  photoUploadError: string = '';
  photoUploadSuccess: string = '';

  editSection: string | null = null;
  activeSection: string = 'basic';
  metaOptions: MetaDataResponse = {} as MetaDataResponse;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserserviceService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => params.get('userId')),
      filter(id => id !== null),
      switchMap(id => this.userService.getUserProfileById(Number(id))),
      takeUntil(this.destroy$)
    ).subscribe(u => {
      this.user = u;
      this.loadUserImages(u.id);
    });

    this.userService.getMetaData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(meta => this.metaOptions = meta);
  }

  scrollTo(sectionId: string) {
    this.activeSection = sectionId;
    this.editSection = null;

    requestAnimationFrame(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  onFileChange(event: Event) {
    if (!this.user || !this.canUploadPhotos(this.user.id)) return;

    const input = event.target as HTMLInputElement;
    const files = input.files;

    this.photoUploadError = '';
    this.photoUploadSuccess = '';

    if (!files || files.length === 0) return;

    const nextFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;

      if (file.size > PhotoUploadMaxSizeBytes) {
        this.photoUploadError = `${file.name} exceeds ${PhotoUploadMaxSizeMB} MB.`;
        continue;
      }

      nextFiles.push(file);
    }

    if (!nextFiles.length) return;

    this.selectedFiles = [...this.selectedFiles, ...nextFiles];
    this.refreshSelectedFilePreviews();
    this.showPhotoActions = true;
    input.value = '';
  }

  uploadSelectedPhotos() {
    if (!this.user || !this.selectedFiles.length || !this.canUploadPhotos(this.user.id)) return;

    this.photoUploadError = '';
    this.photoUploadSuccess = '';
    this.isUploadingPhotos = true;

    const startSortOrder = this.photos.length;
    const sortOrders = this.selectedFiles.map((_, index) => startSortOrder + index);

    this.userService.uploadUserPhotos(this.selectedFiles, sortOrders, this.user.id).subscribe({
      next: () => {
        this.photoUploadSuccess = 'Images uploaded successfully.';
        this.clearSelectedFiles();
        this.loadUserImages(this.user!.id, true);
        this.showDeleteConfirmation = false;
      },
      error: () => {
        this.photoUploadError = 'Upload failed. Please check file size and format.';
      },
      complete: () => {
        this.isUploadingPhotos = false;
      }
    });
  }

  removeSelectedFile(index: number) {
    if (index < 0 || index >= this.selectedFiles.length) return;
    this.selectedFiles.splice(index, 1);
    this.refreshSelectedFilePreviews();

    if (!this.selectedFiles.length) {
      this.photoUploadSuccess = '';
    }
  }

  deletePhoto(photoId: string) {
    if (!this.user || !this.canUploadPhotos(this.user.id)) return;

    this.photoUploadError = '';
    this.photoUploadSuccess = '';

    this.userService.deleteUserImage(this.user.id, photoId).subscribe({
      next: () => {
        this.photoUploadSuccess = 'Image deleted successfully.';
        this.loadUserImages(this.user!.id, true);
        this.showDeleteConfirmation = false;
      },
      error: () => {
        this.photoUploadError = 'Unable to delete image.';
      }
    });
  }

  deleteActivePhoto() {
    const activePhoto = this.photos[this.activePhotoIndex];
    if (!activePhoto) {
      this.photoUploadError = 'No image selected to delete.';
      return;
    }

    this.deletePhoto(activePhoto.id);
  }

  requestDeleteActivePhoto() {
    if (!this.photos.length) {
      this.photoUploadError = 'No image available to delete.';
      return;
    }

    this.photoUploadError = '';
    this.photoUploadSuccess = '';
    this.showDeleteConfirmation = true;
  }

  cancelDeleteActivePhoto() {
    this.showDeleteConfirmation = false;
  }

  private loadUserImages(userId: number, preserveActive: boolean = false) {
    const previousPhotoId = preserveActive ? this.photos[this.activePhotoIndex]?.id : null;

    this.userService.getUserImages(userId).subscribe({
      next: (photos) => {
        this.photos = photos;

        if (!this.photos.length) {
          this.activePhotoIndex = 0;
          this.showDeleteConfirmation = false;
          return;
        }

        if (previousPhotoId) {
          const foundIndex = this.photos.findIndex(photo => photo.id === previousPhotoId);
          this.activePhotoIndex = foundIndex >= 0 ? foundIndex : 0;
        } else {
          this.activePhotoIndex = 0;
        }
      },
      error: () => {
        this.photos = [];
        this.activePhotoIndex = 0;
        this.showDeleteConfirmation = false;
      }
    });
  }

  private refreshSelectedFilePreviews() {
    this.selectedFilePreviews.forEach(item => URL.revokeObjectURL(item.url));
    this.selectedFilePreviews = this.selectedFiles.map(file => ({
      fileName: file.name,
      url: URL.createObjectURL(file)
    }));
  }

  private clearSelectedFiles() {
    this.selectedFiles = [];
    this.selectedFilePreviews.forEach(item => URL.revokeObjectURL(item.url));
    this.selectedFilePreviews = [];
  }

  setActivePhoto(index: number) {
    if (index < 0 || index >= this.photos.length) return;
    this.activePhotoIndex = index;
    this.showDeleteConfirmation = false;
  }

  prevPhoto() {
    if (this.photos.length <= 1) return;
    this.activePhotoIndex = this.activePhotoIndex === 0 ? this.photos.length - 1 : this.activePhotoIndex - 1;
  }

  nextPhoto() {
    if (this.photos.length <= 1) return;
    this.activePhotoIndex = this.activePhotoIndex === this.photos.length - 1 ? 0 : this.activePhotoIndex + 1;
  }

  canUploadPhotos(userId: number): boolean {
    return this.auth.getUserId() === userId;
  }

  togglePhotoActions() {
    if (!this.user || !this.canUploadPhotos(this.user.id)) return;
    this.showPhotoActions = !this.showPhotoActions;
    if (!this.showPhotoActions) {
      this.showDeleteConfirmation = false;
      this.clearSelectedFiles();
    }
  }

  openUploadPicker(fileBtn: HTMLInputElement) {
    this.showDeleteConfirmation = false;
    fileBtn.click();
  }

  onThumbnailDragStart(index: number) {
    if (!this.canReorderPhotos()) return;
    this.dragSourceIndex = index;
  }

  onThumbnailDragOver(event: DragEvent) {
    if (!this.canReorderPhotos()) return;
    event.preventDefault();
  }

  onThumbnailDrop(targetIndex: number) {
    if (!this.canReorderPhotos() || this.dragSourceIndex === null) {
      this.dragSourceIndex = null;
      return;
    }

    const sourceIndex = this.dragSourceIndex;
    this.dragSourceIndex = null;

    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const reorderedPhotos = [...this.photos];
    const [movedPhoto] = reorderedPhotos.splice(sourceIndex, 1);
    reorderedPhotos.splice(targetIndex, 0, movedPhoto);

    this.photos = reorderedPhotos;
    this.activePhotoIndex = targetIndex;

    this.persistPhotoOrder();
  }

  private canReorderPhotos(): boolean {
    return !!this.user && this.canUploadPhotos(this.user.id) && this.photos.length > 1 && !this.isReorderingPhotos;
  }

  private persistPhotoOrder() {
    if (!this.user) return;

    this.isReorderingPhotos = true;
    const orderedIds = this.photos.map(photo => photo.id);

    this.userService.reorderUserImages(this.user.id, orderedIds).subscribe({
      next: () => {
        this.photoUploadSuccess = 'Image order updated.';
      },
      error: () => {
        this.photoUploadError = 'Unable to update image order.';
        this.loadUserImages(this.user!.id, true);
      },
      complete: () => {
        this.isReorderingPhotos = false;
      }
    });
  }

  getActivePhotoUrl(): string {
    const photoUrl = this.photos[this.activePhotoIndex]?.url;
    return photoUrl || this.defaultAvatarUrl;
  }

  saveSection(patch: Partial<UserProfile>) {
    if (!this.user) return;
    const merged = { ...this.user, ...patch };
    this.userService.updateUserProfile(this.user.id, merged).subscribe(updated => {
      this.user = updated;
      this.editSection = null;
    });
  }

  startEdit(section: string) { this.editSection = section; }
  cancelEdit() { this.editSection = null; }

  canEdit(id: number): boolean {
    return this.auth.isAdmin() || this.auth.getUserId() === id;
  }

  onPhotoError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = this.defaultAvatarUrl;
  }

  deleteUser() {
    if (confirm('Permanently delete this account?') && this.user) {
      this.userService.deleteUserProfile(this.user.id).subscribe(() => {
        this.router.navigate(['/user-list']);
      });
    }
  }

  ngOnDestroy() {
    this.clearSelectedFiles();
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateAge(birthDate: string | Date): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  async exportToPDF() {
    if (!this.user) return;

    const data = document.getElementById('profile-content-to-export');

    if (!data) {
      alert('Could not find profile content to export. Please ensure the content is loaded.');
      return;
    }

    try {
      const canvas = await html2canvas(data, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY
      });

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(22);
      pdf.setTextColor(225, 29, 72);
      pdf.text(`Bio-Data: ${this.user.firstName} ${this.user.lastName}`, 15, 20);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated on SoulConnect: ${new Date().toLocaleDateString()}`, 15, 28);

      pdf.addImage(contentDataURL, 'PNG', 0, 35, imgWidth, imgHeight);

      const fileName = `BioData_${this.user.firstName}_${this.user.lastName}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF Generation failed', error);
      alert('Failed to generate PDF. Make sure your browser allows downloads from this site.');
    }
  }

  defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzNSIgZmlsbD0iI2QxZDVkYiIvPjxwYXRoIGQ9Ik0gNjUgMTA1IFEgNjUgMTEwIDcwIDExMCBMIDEzMCAxMTAgUSAxMzUgMTEwIDEzNSAxMDUgTCAxMzUgMTcwIFEgMTM1IDE3NSAxMzAgMTc1IEwgNzAgMTc1IFEgNjUgMTc1IDY1IDE3MCBaIiBmaWxsPSIjZDFkNWRiIi8+PC9zdmc+';
}
