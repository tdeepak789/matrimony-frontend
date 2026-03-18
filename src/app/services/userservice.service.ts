import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreatedUserProfileResponse, CreateUserProfile, UserProfile } from '../models/app.models';
import { Observable, shareReplay } from 'rxjs';
import { MetaDataResponse } from '../models/MetaDataResponse';
import { BaseUrl } from '../models/constants';

@Injectable({
  providedIn: 'root'
})
export class UserserviceService {
  
  deleteUserProfile(userId: number) {
    return this.http.delete<any>(`${this.apiUrl}/User/profiles/${userId}`);
  }
  updateUserProfile(userId: number, userProfile: any) {
    return this.http.put<any>(`${this.apiUrl}/User/profiles/${userId}`, userProfile);
  }
  private metadata$: Observable<MetaDataResponse> | null = null;
  getUserProfileById(userId: number) : Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/User/profiles/${userId}`);
  }
  getFileUrl(userId: number): string {
    return `${this.apiUrl}/File/download/${userId}`;
  }
  apiUrl = `${BaseUrl}/api`; // Replace with your actual API endpoint
  constructor(private http:HttpClient) { }

  getUsersProfiles(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/User/profiles`);
  }

  addUserProfile(profile: any): Observable<CreatedUserProfileResponse> {
    return this.http.post<any>(`${this.apiUrl}/User/profiles`, profile);
  }

  getMetaData(): Observable<any> {
    // return this.http.get<MetaDataResponse>(`${this.apiUrl}/metadata`);
    if (!this.metadata$) {
      this.metadata$ = this.http.get<MetaDataResponse>(`${this.apiUrl}/metadata`).pipe(
        shareReplay(1) // ✅ cache the latest value, so request happens only once
      );
    }
    return this.metadata$;
  }
  uploadUserPhotos(files: File[], userId: number): Observable<any> {
    const formData: FormData = new FormData();
    
    files.forEach((file) => {
      // The first argument MUST match the name of the parameter in your C# method (files)
      formData.append('files', file, file.name);
    });

    // IMPORTANT: Do NOT set HttpHeaders for 'Content-Type'. 
    // Let the browser set it to 'multipart/form-data' with the correct boundary.
    return this.http.post<any>(`${this.apiUrl}/File/upload/${userId}`, formData);
  }

  addUserToInterestedProfile(userId:number, userProfileId:number):Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Interests/${userId}/${userProfileId}`,null);
  }

  getInterestedProfiles(userId:number) {

    return this.http.get<any>(`${this.apiUrl}/Interests/${userId}`);
  }
  removeUserFromInterestedProfile(userId:number, userProfileId:number) {
    return this.http.delete<any>(`${this.apiUrl}/Interests/${userId}/${userProfileId}`);
  }
}
