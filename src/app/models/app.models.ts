export interface UserProfile {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;   // ISO string from API (e.g., 2025-08-26T16:35:32.373Z)
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
  id?: number;           // nullable in C#
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;   // Use string because JSON Date comes as ISO string
  gender: string;
  bio?: string;

  createdAt: string;     // timestamp without timezone -> ISO string
  updatedAt: string;

  height: number;
  maritalStatus: string;

  religion?: string;
  caste?: string;
  subcaste?: string;
  gothram?: string;
  star?: string;
  rasi?: string;
  education?: string;
  occupation?: string;
  income: number;
  workLocation?: string;
  country?: string;
  state?: string;
  city?: string;
  motherTongue?: string;
  phoneNumber: number;
  isActive: number;      // short -> number
}
