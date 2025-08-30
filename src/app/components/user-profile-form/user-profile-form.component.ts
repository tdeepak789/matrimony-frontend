import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../../models/app.models';
import { UserserviceService } from '../../services/userservice.service';
import { CommonModule } from '@angular/common';
import { MetaDataResponse } from '../../models/MetaDataResponse';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-profile-form',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './user-profile-form.component.html',
  styleUrl: './user-profile-form.component.scss'
})
export class UserProfileFormComponent {

  religions: string[] = [];
  maritalStatuses: string[] =[];
  languages: string[]=[];
  countries: string[]=[];
  states: string[]=[];
  cities: string[]=[];
  genders: string[]=[];
  star: string[]=[];
  rasi: string[]=[];
  selectedFiles: File[] = [];

  isEditMode = false;
  userId!: number;
  
  ngOnInit() {
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

    this.userId = Number(this.route.snapshot.paramMap.get('userId'));
    if (this.userId) {
      this.isEditMode = true;
      this.loadUserProfile(this.userId);
    }
  }
  constructor(private userService: UserserviceService , private router:Router,private route: ActivatedRoute) {}
  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', Validators.required),
    timeOfBirth: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
    bio: new FormControl(''),
    createdAt: new FormControl(''),
    updatedAt: new FormControl(''),
    height: new FormControl(0),
    maritalStatus: new FormControl(''),
    religion: new FormControl(''),
    caste: new FormControl(''),
    subcaste: new FormControl(''),
    gothram: new FormControl(''),
    star: new FormControl(''),
    rasi: new FormControl(''),
    education: new FormControl(''),
    occupation: new FormControl(''),
    income: new FormControl(0),
    workLocation: new FormControl(''),
    country: new FormControl(''),
    state: new FormControl(''),
    city: new FormControl(''),
    motherTongue: new FormControl(''),
    phoneNumber: new FormControl(0)
  });
  onFileChange(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 3) {
      alert("You can upload up to 3 pictures only.");
      return;
    }
    this.selectedFiles = [];
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const birthDateTime = `${this.profileForm.value.dateOfBirth}T${this.profileForm.value.timeOfBirth}:00`;
      const newProfile = {
                          Email: this.profileForm.value.email,
                          FirstName: this.profileForm.value.firstName,
                          LastName: this.profileForm.value.lastName,
                          DateOfBirth: birthDateTime,
                          Gender: this.profileForm.value.gender,
                          Bio: this.profileForm.value.bio,
                          
                          Height: this.profileForm.value.height,
                          MaritalStatus: this.profileForm.value.maritalStatus,
                          Religion: this.profileForm.value.religion,
                          Caste: this.profileForm.value.caste,
                          Subcaste: this.profileForm.value.subcaste,
                          Gothram: this.profileForm.value.gothram,
                          Star: this.profileForm.value.star,
                          Rasi: this.profileForm.value.rasi,
                          Education: this.profileForm.value.education,
                          Occupation: this.profileForm.value.occupation,
                          Income: this.profileForm.value.income,
                          WorkLocation: this.profileForm.value.workLocation,
                          Country: this.profileForm.value.country,
                          State: this.profileForm.value.state,
                          City: this.profileForm.value.city,
                          MotherTongue: this.profileForm.value.motherTongue,
                          PhoneNumber: this.profileForm.value.phoneNumber
                        };
      console.log('Submitting profile:', newProfile);
      if(!this.isEditMode){
          this.userService.addUserProfile(newProfile ).subscribe(
          (response) => {
            console.log('User profile added successfully:', response);
            this.profileForm.reset();
            this.router.navigate(['user-details', response.id]);
          },
          (error) => {
            console.error('Error adding user profile:', error);
          }
        );
      }
      else
      {
        this.userService.updateUserProfile(this.userId, newProfile).subscribe(
        res => {
          console.log('User updated:', res);
          this.router.navigate(['user-details', this.userId]);
        },
        err => console.error(err)
      );
      }
      
    } else {
      alert("Please fill all required fields correctly.");
      alert(JSON.stringify(this.profileForm.errors));
      console.error('Form is invalid');
    }
  }

  loadUserProfile(id: number) {
    this.userService.getUserProfileById(id).subscribe(user => {
      this.profileForm.patchValue({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth.split('T')[0],
        timeOfBirth: new Date(user.dateOfBirth).toISOString().substring(11,16),
        gender: user.gender,
        bio: user.bio,
        height: user.height,
        maritalStatus: user.maritalStatus,
        religion: user.religion,
        caste: user.caste,
        subcaste: user.subcaste,
        gothram: user.gothram,
        star: user.star,
        rasi: user.rasi,
        education: user.education,
        occupation: user.occupation,
        income: user.income,
        workLocation: user.workLocation,
        country: user.country,
        state: user.state,
        city: user.city,
        motherTongue: user.motherTongue,
        phoneNumber: user.phoneNumber
      });
    });
  }
}
