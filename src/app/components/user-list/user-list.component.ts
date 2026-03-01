import { Component } from '@angular/core';
import { UserProfile } from '../../models/app.models';
import { UserserviceService } from '../../services/userservice.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MetaDataResponse } from '../../models/MetaDataResponse';
import { AuthService } from '../../auth.service';


@Component({
  selector: 'app-user-list',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, FormsModule,CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  users: UserProfile[] = [];
  selectedFiles: File[] = [];
  selectedGender: string = '';
  selectedReligion: string = '';
  selectedCaste: string = '';
  selectedMaritalStatus: string = '';

  searchText: string = '';

  religions: string[] = [];
  maritalStatuses: string[] =[];
  languages: string[]=[];
  countries: string[]=[];
  states: string[]=[];
  cities: string[]=[];
  genders: string[]=[];
  star: string[]=[];
  rasi: string[]=[];
  caste: string[]=[];

  showInterests:boolean=false;

  interestedUserProfiles: UserProfile[]=[];
  profilesInterestedInUser: UserProfile[]=[];
  interestView: 'byUser' | 'inUser' = 'byUser';

  setInterestView(view: 'byUser' | 'inUser') {
    this.interestView = view;
  }
  constructor(private userService: UserserviceService, private router: Router,public auth:AuthService,private route: ActivatedRoute ) {}

  ngOnInit() {
    this.userService.getUsersProfiles().subscribe(
      (data: UserProfile[]) => {
        this.users = data;
        console.log('Fetched user profiles:', this.users);
      },
      (error) => {
        console.error('Error fetching user profiles:', error);
      }
    );

    this.userService.getMetaData().subscribe({
         next:( data:MetaDataResponse) => {
            this.religions = data.religions;
            this.maritalStatuses = data.maritalStatuses;
            this.languages = data.languages;
            this.countries = data.countries;
            this.states = data.states;
            this.cities = data.cities;
            this.genders = data.genders;
            this.star = data.star;
            this.rasi = data.rasi;
            console.log('Fetched metadata:', data);
          },
          error: (error) => {
            console.error('Error fetching metadata:', error);
          }
      });
      this.route.url.subscribe(urlSegments => {
        const isInterests = urlSegments.some(seg => seg.path === 'user-interests');
        this.showInterests = isInterests;
      });
      this.userService.getInterestedProfiles(this.auth.getUserId()).subscribe(
        (response:any)=>
        {
          this.interestedUserProfiles = response?.profilesInterestedByUser;
          this.profilesInterestedInUser = response?.profilesInterestedInUser;
        },
        (error:any)=>
        {
          console.error('Error fetching user interests profiles:', error);
        }
          
      );
  }

  onFileChange(event: any, id:any) {
    const files: FileList = event.target.files;
    console.log('Selected user to file upload', id);
    if (files.length > 3) {
      alert("You can upload up to 3 pictures only.");
      return;
    }
    this.selectedFiles = [];
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
  }
   onPhotoSubmit(userId:any) {
    if (this.selectedFiles.length === 0) {
      
      return;
    }
    if(this.selectedFiles.length > 3) {
      alert("You can upload up to 3 pictures only.");
      return;
    }
    this.userService.uploadUserPhotos(this.selectedFiles,userId ).subscribe(
        (response) => {
          console.log('User profile added successfully:', response);
          alert(`Photos uploaded successfully! ${response}` );
           this.router.navigate(['']);
        },
        (error) => {
          console.error('Error adding user profile:', error);
        }
      );
    // Handle form submission logic here
    console.log('Selected files:', this.selectedFiles);
  }
  // use absolute path to avoid relative-route 404s (e.g. /user-details/...)
  defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMGUwZTAiLz4KICAKICA8IS0tIEhlYWQgLS0+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNzAiIHI9IjM1IiBmaWxsPSIjOTk5Ii8+CiAgCiAgPCEtLSBCb2R5IC0tPgogIDxwYXRoIGQ9Ik0gNjUgMTA1IFEgNjUgMTEwIDcwIDExMCBMIDEzMCAxMTAgUSAxMzUgMTEwIDEzNSAxMDUgTCAxMzUgMTcwIFEgMTM1IDE3NSAxMzAgMTc1IEwgNzAgMTc1IFEgNjUgMTc1IDY1IDE3MCBaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPg==';

  getFileUrl(userId: any): string {
    return `http://localhost:5145/api/File/download/${userId}`;
  }

  onPhotoError(event: any) {
    const img = event?.target as HTMLImageElement | undefined;
    if (!img) return;
    // Avoid re-setting fallback repeatedly (prevents flicker/shaking)
    if (img.dataset && img.dataset['fallback'] === '1') return;
    img.onerror = null;
    img.dataset['fallback'] = '1';
    img.src = this.defaultAvatarUrl;
  }
  filteredUsers(): UserProfile[] {
    let filtered = this.showInterests
  ?(this.interestView === 'byUser')?this.interestedUserProfiles ?? []: this.profilesInterestedInUser ?? []
  : this.users;

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(u =>
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search)
      );
    }

    if (this.selectedGender) {
      filtered = filtered.filter(u => u.gender === this.selectedGender);
    }

    if (this.selectedReligion) {
      filtered = filtered.filter(u => u.religion === this.selectedReligion);
    }

    if (this.selectedCaste) {
      filtered = filtered.filter(u => (u.caste).toLowerCase().includes(this.selectedCaste.toLowerCase()));
    }

    if (this.selectedMaritalStatus) {
      filtered = filtered.filter(u => u.maritalStatus === this.selectedMaritalStatus);
    }

    return filtered;
  }

  deleteUser(userId: any) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUserProfile(userId).subscribe(
        (response) => {
          console.log(`User ${userId} deleted successfully`);
          alert('User deleted successfully');
          this.router.navigate(['user-list']);
          
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  addUserToInterestedProfile(userId: any)
  {
    this.userService.addUserToInterestedProfile(this.auth.getUserId(),userId).subscribe(
      (response)=>
      {
        console.log(`User added to interested to profile success fully`);
      },
      (error)=>
      {
        console.error("Error while adding user to interested profiles");
      }
    );
  }
  isUserInterested(userId: number): boolean {
    return (this.interestedUserProfiles ?? []).some(u => u.id === userId);
  }

  removeUserFromInterestedProfile(userId: number) 
  {
    this.userService.removeUserFromInterestedProfile(this.auth.getUserId(), userId).subscribe(
      (response) => {
        // Remove user from local array for instant UI update
          this.userService.getInterestedProfiles(this.auth.getUserId()).subscribe(
          (response:any)=>
          {
            this.interestedUserProfiles = response?.profilesInterestedByUser;
            this.profilesInterestedInUser = response?.profilesInterestedInUser;
          },
          (error:any)=>
          {
            console.error('Error fetching user interests profiles:', error);
          }
            
        );
        console.log('User removed from interested profiles');
      },
      (error) => {
        console.error('Error removing user from interested profiles', error);
      }
    );
  }
  UpdateShowInterests()
  {
    this.showInterests = !this.showInterests;
  }
  trackByUserId(index: number, user: UserProfile) {
     return user.id;
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
  toggleInterest(userId: number) {
  if (this.isUserInterested(userId)) {
    this.removeUserFromInterestedProfile(userId);
  } else {
    this.addUserToInterestedProfile(userId);
  }
}
}
