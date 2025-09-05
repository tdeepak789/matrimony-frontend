import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
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
