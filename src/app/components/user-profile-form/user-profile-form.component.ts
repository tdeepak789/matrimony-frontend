import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../../models/app.models';
import { UserserviceService } from '../../services/userservice.service';
import { CommonModule } from '@angular/common';
import { MetaDataResponse } from '../../models/MetaDataResponse';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-profile-form',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './user-profile-form.component.html',
  styleUrl: './user-profile-form.component.scss'
})
export class UserProfileFormComponent {

  selectedFiles: File[] = [];
  step = 0; 
  isEditMode = false;
  userId!: number;
  metaOptions: { [key: string]: string[] } = {}

  steps: FormStep[] = [
  {
    label: 'Basic Details',
    controls: ['firstName','lastName','email','phoneNumber','password','dateOfBirth','timeOfBirth','gender','motherTongue','height'],
    fields: [
      { name: 'firstName', label: 'First Name', type: FieldType.Text, required: true, placeholder: "Enter your first name" },
      { name: 'lastName', label: 'Last Name', type: FieldType.Text, required: true , placeholder: "Enter your Last name"},
      { name: 'email', label: 'Email', type: FieldType.Email, required: true, placeholder:"example@mail.com" },
      { name: 'phoneNumber', label: 'Phone Number', type: FieldType.Text, required: true , placeholder: "987 654" },
      { name: 'password', label: 'Password', type: FieldType.Password, required: true , placeholder:"Type your password"},
      { name: 'dateOfBirth', label: 'Date of Birth', type: FieldType.Date, required: true },
      { name: 'timeOfBirth', label: 'Time Of Birth', type: FieldType.Time, required: true },
      { name: 'gender', label: 'Gender', type: FieldType.Select,  required: true },
      { name: 'height',label:'Height',type:FieldType.Number,required:true , placeholder:"In cms"},
      { name: 'motherTongue', label: 'Mother Tongue', type: FieldType.Select, required: true },
      { name: 'bio', label: 'Your Bio', type:FieldType.Text,placeholder:"Tell about your self"}
    ]
  },
  {
    label: 'Religious Details',
    controls: ['religion','caste','subcaste','gothram','star','rasi'],
    fields: [
      { name: 'religion', label: 'Religion', type: FieldType.Select, required: true },
      { name: 'caste', label: 'Caste', type:  FieldType.Text, placeholder: "Caste name" },
      { name: 'subcaste', label: 'Subcaste', type:  FieldType.Text, placeholder: "optional"},
      { name: 'gothram', label: 'Gothram', type:  FieldType.Text, placeholder:"optional" },
      { name: 'star', label: 'Star', type: FieldType.Select },
      { name: 'rasi', label: 'Rasi', type: FieldType.Select }
    ]
  },
  {
    label: 'Professional Details',
    controls:['education', 'occupation','income'],
    fields:[
      {name:'education',label:'Education',type:FieldType.Text , placeholder:"Btech or Degree"},
      {name:'occupation',label:'Occupation',type:FieldType.Text, placeholder: "Engineer or Doctor"},
      {name:'income',label:'Income',type:FieldType.Number},
      {name:'workLocation',label:'Work Location',type:FieldType.Text, placeholder: "Chennai or Bangalore"}
    ]
  },
  {
    label:'Address',
    controls:['country','state','city'],
    fields:[
      {name:'country',label:'Country',type:FieldType.Select},
      {name:'state',label:'State',type:FieldType.Select},
      {name:'city',label:'City',type:FieldType.Select}
    ]
  }
];

  
  ngOnInit() {
     this.userService.getMetaData().subscribe({
     next:( data:MetaDataResponse) => {
      this.metaOptions={
        religion : data.religions,
        maritalStatus : data.maritalStatuses,
        motherTongue : data.languages,
        country : data.countries,
        state : data.states,
        city : data.cities,
        gender : data.genders,
        star : data.star,
        rasi : data.rasi
      }
        
        console.log('Fetched metadata:', data);
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      }
    });

    this.userId = Number(this.route.snapshot.paramMap.get('userId'));
    if (this.userId) {
      this.isEditMode = true;
    }
  }
  constructor(private userService: UserserviceService , private router:Router,private route: ActivatedRoute, private authService:AuthService) {}
  profileForm = new FormGroup({
    email: new FormControl('',  Validators.email),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    password: new FormControl('',Validators.required),
    dateOfBirth: new FormControl('', Validators.required),
    timeOfBirth: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
    bio: new FormControl(''),
    height: new FormControl(null,[Validators.required,Validators.min(1)]),
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
    phoneNumber: new FormControl(null,[Validators.required,Validators.minLength(5)])
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

  nextStep() {
    const controls = this.steps[this.step].controls;
    let valid = true;
    for (let ctrl of controls) {
      if (this.profileForm.get(ctrl)?.invalid) {
        this.profileForm.get(ctrl)?.markAsTouched();
        valid = false;
      }
    }
    if (valid) this.step++;
  }

  previousStep() {
    if (this.step > 0) this.step--;
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
                          Password : this.profileForm.value.password,
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
            this.authService.saveToken(response.token);
            this.router.navigate(['user-details', response.userId]);
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
      const invalidFields: string[] = [];

      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key);
        }
      });

      alert("Please fill all required fields: " + invalidFields.join(", "));
      console.error('Form is invalid', invalidFields);
    }
  }
}

interface FormStep {
  label: string;
  controls: string[];        // list of formControlNames in this step
  fields: FieldConfig[];     // metadata for each field
}

interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];        // for dropdowns
  required?: boolean;
  placeholder?: string;
}


export enum FieldType {
  Text = 'text',
  Email = 'email',
  Password = 'password',
  Number = 'number',
  Date = 'date',
  Time = 'time',
  Select = 'select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  TextArea = 'textarea',
  File = 'file'
}