import { Component, Input } from '@angular/core';
import { UserProfile } from '../../models/app.models';
import { UserserviceService } from '../../services/userservice.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-details',
  imports: [DatePipe, RouterLink],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent {
  user: UserProfile | null = null;
  selectedFiles: File[] = [];
  @Input() userId!: number;
  constructor(private userService: UserserviceService, private route: ActivatedRoute, private router: Router) { }
  ngOnInit() {
    let idToUse: number | null = null;

    if (this.userId) {
      idToUse = this.userId; // parent passed
    } else {
      const idFromRoute = this.route.snapshot.paramMap.get('userId');
      if (idFromRoute) idToUse = +idFromRoute; // from URL
    }
    if (idToUse) {
      // fetch single user
      this.userService.getUserProfileById(idToUse).subscribe(
        (user: UserProfile) => {
          this.user = user; // wrap in array to reuse template
          console.log('Fetched specific user profile:', user);
        },
        (error) => {
          console.error('Error fetching user profile:', error);
        }
      );
    }
  }
  onFileChange(event: any, id: any) {
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

  onPhotoSubmit(userId: any) {
    if (this.selectedFiles.length === 0) {

      return;
    }
    if (this.selectedFiles.length > 3) {
      alert("You can upload up to 3 pictures only.");
      return;
    }
    this.userService.uploadUserPhotos(this.selectedFiles, userId).subscribe(
      (response) => {
        console.log('User profile added successfully:', response);
        this.router.navigate(['user-details', userId]);
        alert(`Photos uploaded successfully! ${response}`);

      },
      (error) => {
        console.error('Error adding user profile:', error);
      }
    );
    // Handle form submission logic here
    console.log('Selected files:', this.selectedFiles);
  }

  getFileUrl(userId: any): string {
    return `http://localhost:5145/api/File/download/${userId}`;;
  }
  deleteUser(userId: any) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUserProfile(userId).subscribe(
        (response) => {
          console.log(`User ${userId} deleted successfully`);
          alert('User deleted successfully');
          this.router.navigate(['']);
         
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }
}
