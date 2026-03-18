import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// IMPORTANT: Add these for the menu to function
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseUrl } from '../models/constants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    MatMenuModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isCreateUserProfilePage(): boolean {
    return this.router.url === '/user-profile';
  }

  // Helper for the avatar source
  getAvatarUrl(): string {
    const userId = this.auth.getUserId();
    return userId ? `${BaseUrl}/api/File/download/${userId}` : 'assets/default-avatar.png';
  }
}