import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreatedUserProfileResponse, UserPhoto, UserProfile } from '../models/app.models';
import { Observable, shareReplay } from 'rxjs';
import { MetaDataResponse, MetadataOption } from '../models/MetaDataResponse';
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
  getUserImages(userId: number): Observable<UserPhoto[]> {
    return this.http.get<UserPhoto[]>(`${this.apiUrl}/File/users/${userId}/images`);
  }
  apiUrl = `${BaseUrl}/api`; // Replace with your actual API endpoint
  constructor(private http:HttpClient) { }

  getUsersProfiles(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/User/profiles`);
  }

  addUserProfile(profile: any): Observable<CreatedUserProfileResponse> {
    return this.http.post<any>(`${this.apiUrl}/User/profiles`, profile);
  }

  getMetaData(): Observable<MetaDataResponse> {
    if (!this.metadata$) {
      this.metadata$ = this.http.get<MetaDataResponse>(`${this.apiUrl}/metadata`).pipe(
        shareReplay(1)
      );
    }
    return this.metadata$;
  }

  clearMetaDataCache(): void {
    this.metadata$ = null;
  }

  getMetadataOptions(category: string, parentId?: number, search?: string): Observable<MetadataOption[]> {
    const queryParams = new URLSearchParams();
    if (parentId !== undefined && parentId !== null) {
      queryParams.set('parentId', parentId.toString());
    }
    if (search) {
      queryParams.set('search', search);
    }

    const query = queryParams.toString();
    const endpoint = `${this.apiUrl}/metadata/options/${encodeURIComponent(category)}${query ? `?${query}` : ''}`;
    return this.http.get<MetadataOption[]>(endpoint);
  }
  uploadUserPhotos(files: File[], sortOrders: number[], userId: number): Observable<any> {
    const formData: FormData = new FormData();

    files.forEach((file, index) => {
      formData.append('files', file, file.name);
      formData.append('sortOrders', `${sortOrders[index]}`);
    });

    return this.http.post<any>(`${this.apiUrl}/File/upload/${userId}`, formData);
  }

  deleteUserImage(userId: number, imageId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/File/users/${userId}/images/${imageId}`);
  }

  reorderUserImages(userId: number, orderedImageIds: string[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/File/users/${userId}/images/order`, orderedImageIds);
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
