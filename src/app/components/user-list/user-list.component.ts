import { Component } from '@angular/core';
import { UserProfile } from '../../models/app.models';
import { UserserviceService } from '../../services/userservice.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  constructor(private userService: UserserviceService, private router: Router,public auth:AuthService) {}

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
  getFileUrl(userId: any): string {
    return `http://localhost:5145/api/File/download/${userId}`; ;
  }
  filteredUsers(): UserProfile[] {
    let filtered = this.users;

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
}
