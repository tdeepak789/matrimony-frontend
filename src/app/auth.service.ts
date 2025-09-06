import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {jwtDecode} from 'jwt-decode';


interface JwtPayload {
  role?: string; // might also be serialized with a long URI, see below
  userProfileId?: string;
  FirstNamw?: string; // typo carried from backend
  LastName?: string;
  Gender?: string;
  [key: string]: any; // fallback for unexpected keys
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5145/api/auth'; // your backend URL
  private tokenKey = 'authToken';
  private userId = 'userId';
  private userRole = 'userRole';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    const decoded = jwtDecode<JwtPayload>(token);
    const role = decoded ? decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']:null ;
      localStorage.setItem(this.userRole, role);

    

  }

  getUserId():number{
    return Number(localStorage.getItem(this.userId))
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userId);
    this.router.navigate(['/login']);
  }
  
  getRole(): string | null {
    return localStorage.getItem(this.userRole);
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveUserId(id:number)
  {
    localStorage.setItem(this.userId,id+"");
  }
}
