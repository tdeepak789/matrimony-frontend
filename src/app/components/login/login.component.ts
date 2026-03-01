import { Component, Injectable } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // We include FormsModule for [(ngModel)] and RouterModule for the 'Register' link
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false; // UX: Loading indicator

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);
        this.auth.saveUserId(res.userId);
        this.router.navigate(['/user-list']);
      },
      error: (err) => {
        this.isLoading = false;
        alert('Invalid credentials. Please try again.');
        console.error('Login failed', err);
      },
      complete: () => this.isLoading = false
    });
  }
}