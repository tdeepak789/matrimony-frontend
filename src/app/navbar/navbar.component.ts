import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(public auth:AuthService, private router:Router)
  {

  }
  logout()
  {
    this.auth.logout();
  }
  isLoginPage()
  {
      return this.router.url.startsWith("/login") || this.router.url.startsWith("");
  }
  isCreateUserProfilePage()
  {
      return (this.router.url.startsWith("/user-profile") ||this.router.url.startsWith(""));
  }
  
}
