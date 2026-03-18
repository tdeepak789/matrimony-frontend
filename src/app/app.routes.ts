import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserProfileFormComponent } from './components/user-profile-form/user-profile-form.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'user-list', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'user-profile', component: UserProfileFormComponent },
  { path: 'user-details/:userId', component: UserDetailsComponent, canActivate: [AuthGuard] },
  { path: 'user-edit/:userId', component: UserProfileFormComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'user-interests', component: UserListComponent, canActivate: [AuthGuard] }, // Reuse component
  { path: '', redirectTo: 'user-list', pathMatch: 'full' },
];