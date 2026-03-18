import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, map, filter, switchMap } from 'rxjs';

import { UserserviceService } from '../../services/userservice.service';
import { AuthService } from '../../auth.service';
import { UserProfile } from '../../models/app.models';
import { MetaDataResponse } from '../../models/MetaDataResponse';

// Import child components
import { UserBasicDetailsComponent } from './user-basic-details/user-basic-details.component';
import { UserReligiousDetailsComponent } from './user-religious-details/user-religious-details.component';
import { UserProfessionalDetailsComponent } from './user-professional-details/user-professional-details.component';
import { UserAddressDetailsComponent } from './user-address-details/user-address-details.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BaseUrl } from '../../models/constants';


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
    ).subscribe(u => this.user = u);

    this.userService.getMetaData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(meta => this.metaOptions = meta);
  }

  // --- NAVIGATION & SWITCHING ---
  scrollTo(sectionId: string) {
    this.activeSection = sectionId;
    this.editSection = null; // Reset edit mode to ensure correct height

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

  // --- PHOTO UPLOAD ---
  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0 && this.user) {
      this.userService.uploadUserPhotos(Array.from(files), this.user.id).subscribe({
        next: () => {
          // Force image refresh using timestamp
          const img = document.querySelector('.profile-img') as HTMLImageElement;
          if (img) {
            img.src = `${this.userService.getFileUrl(this.user!.id)}?t=${new Date().getTime()}`;
          }
          alert('Photo updated!');
        },
        error: (err) => alert('Upload failed. Check file size and format.')
      });
    }
  }

  // --- PROFILE ACTIONS ---
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

  onPhotoError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMwIiByPSIxNSIgZmlsbD0iIzk0YTNCOCIvPjxwYXRoIGQ9Ik0yMCA2MUMyMCA1MCAzMCA0NSA0MCA0NVM2MCA1MCA2MCA2MVY3MEgyMFY2MVoiIGZpbGw9IiM5NGEzQjgiLz48L3N2Zz4=';
  }

  deleteUser() {
    if (confirm('Permanently delete this account?') && this.user) {
      this.userService.deleteUserProfile(this.user.id).subscribe(() => {
        this.router.navigate(['/user-list']);
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  calculateAge(birthDate: string | Date): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  getFileUrl(userId: number | any): string {
    if (!userId) return this.defaultAvatarUrl;
    
    // Replace with your actual backend domain if it's not localhost
    const baseUrl = `${BaseUrl}/api/File/download`;
    
    // Tip: Adding a timestamp (?t=...) helps bypass browser cache 
    // when a user uploads a new photo.
    return `${baseUrl}/${userId}`;
  }

  async exportToPDF() {
  if (!this.user) return;

  const data = document.getElementById('profile-content-to-export');
  
  if (!data) {
    alert("Could not find profile content to export. Please ensure the content is loaded.");
    return;
  }

  try {
    // 1. Capture the element
    const canvas = await html2canvas(data, {
      scale: 2,
      useCORS: true, 
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY // Fixes positioning if the page is scrolled
    });

    // 2. Prepare PDF
    const contentDataURL = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 3. Add Header
    pdf.setFontSize(22);
    pdf.setTextColor(225, 29, 72); // Rose-600
    pdf.text(`Bio-Data: ${this.user.firstName} ${this.user.lastName}`, 15, 20);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139); // Slate-500
    pdf.text(`Generated on SoulConnect: ${new Date().toLocaleDateString()}`, 15, 28);

    // 4. Add Content
    pdf.addImage(contentDataURL, 'PNG', 0, 35, imgWidth, imgHeight);

    // 5. Trigger Download
    const fileName = `BioData_${this.user.firstName}_${this.user.lastName}.pdf`;
    
    // This method forces the browser to treat it as a download
    pdf.save(fileName);

    console.log('PDF Saved successfully');
  } catch (error) {
    console.error('PDF Generation failed', error);
    alert('Failed to generate PDF. Make sure your browser allows downloads from this site.');
  }
}
  // Fallback SVG for when a user has no photo
  defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzNSIgZmlsbD0iI2QxZDVkYiIvPjxwYXRoIGQ9Ik0gNjUgMTA1IFEgNjUgMTEwIDcwIDExMCBMIDEzMCAxMTAgUSAxMzUgMTEwIDEzNSAxMDUgTCAxMzUgMTcwIFEgMTM1IDE3NSAxMzAgMTc1IEwgNzAgMTc1IFEgNjUgMTc1IDY1IDE3MCBaIiBmaWxsPSIjZDFkNWRiIi8+PC9zdmc+';
}