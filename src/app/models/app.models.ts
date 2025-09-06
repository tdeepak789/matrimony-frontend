export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;   
  gender: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  height: number;
  maritalStatus: string;
  religion: string;
  caste: string;
  subcaste: string;
  gothram: string;
  star: string;
  rasi: string;
  education: string;
  occupation: string;
  income: number;
  workLocation: string;
  country: string;
  state: string;
  city: string;
  motherTongue: string;
  phoneNumber: number;
}


export interface CreateUserProfile {

  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;   // ISO string from API (e.g., 2025-08-26T16:35:32.373Z)
  gender: string;
  bio: string;
  height: number;
  maritalStatus: string;
  religion: string;
  caste: string;
  subcaste: string;
  gothram: string;
  star: string;
  rasi: string;
  education: string;
  occupation: string;
  income: number;
  workLocation: string;
  country: string;
  state: string;
  city: string;
  motherTongue: string;
  phoneNumber: number;
}


export interface CreatedUserProfileResponse {
  token:string;
  userId:number;
}
