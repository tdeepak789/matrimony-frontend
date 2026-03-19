import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
// IMPORTANT: Add these for the menu to function
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserserviceService } from '../services/userservice.service';
import { Subject, filter, takeUntil } from 'rxjs';

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
  private readonly defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzNSIgZmlsbD0iI2QxZDVkYiIvPjxwYXRoIGQ9Ik0gNjUgMTA1IFEgNjUgMTEwIDcwIDExMCBMIDEzMCAxMTAgUSAxMzUgMTEwIDEzNSAxMDUgTCAxMzUgMTcwIFEgMTM1IDE3NSAxMzAgMTc1IEwgNzAgMTc1IFEgNjUgMTc1IDY1IDE3MCBaIiBmaWxsPSIjZDFkNWRiIi8+PC9zdmc+';
  avatarUrl: string = this.defaultAvatarUrl;
  private destroy$ = new Subject<void>();

  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserserviceService
  ) {}

  ngOnInit() {
    this.loadAvatar();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.loadAvatar());
  }

  logout() {
    this.auth.logout();
    this.avatarUrl = this.defaultAvatarUrl;
    this.router.navigate(['/login']);
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isCreateUserProfilePage(): boolean {
    return this.router.url === '/user-profile';
  }

  private loadAvatar() {
    if (!this.auth.isLoggedIn()) {
      this.avatarUrl = this.defaultAvatarUrl;
      return;
    }

    const userId = this.auth.getUserId();
    if (!userId) {
      this.avatarUrl = this.defaultAvatarUrl;
      return;
    }

    this.userService.getUserImages(userId).subscribe({
      next: (photos) => {
        this.avatarUrl = photos?.[0]?.url ?? this.defaultAvatarUrl;
      },
      error: () => {
        this.avatarUrl = this.defaultAvatarUrl;
      }
    });
  }

  onAvatarError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = this.defaultAvatarUrl;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}