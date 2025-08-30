import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserProfileFormComponent } from './components/user-profile-form/user-profile-form.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';

export const routes: Routes = [
  { path: '', component: UserListComponent ,},
  { path: 'user-profile', component: UserProfileFormComponent},
  { path: 'user-details/:userId', component: UserDetailsComponent},
  { path: 'user-edit/:userId', component: UserProfileFormComponent},
];