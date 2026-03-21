import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserListQuery, UserPhoto, UserProfile } from '../../models/app.models';
import { UserserviceService } from '../../services/userservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MetaDataResponse, MetadataOption } from '../../models/MetaDataResponse';
import { AuthService } from '../../auth.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-user-list',
  imports: [ReactiveFormsModule, RouterLink, FormsModule, CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  @ViewChild('listTop') listTop!: ElementRef<HTMLElement>;
  users: UserProfile[] = [];
  currentPage = 1;
  pageSize =3;
  totalUsersCount = 0;
  userImagesMap: Record<number, UserPhoto[]> = {};
  activeImageIndexMap: Record<number, number> = {};
  selectedGender: string = '';
  selectedReligion: string = '';
  selectedCaste: string = '';
  selectedMaritalStatus: string = '';

  searchText: string = '';

  religions: string[] = [];
  maritalStatuses: string[] =[];
  languages: string[]=[];
  countries: string[]=[];
  states: string[]=[];
  cities: string[]=[];
  genders: string[]=[];
  star: string[]=[];
  rasi: string[]=[];
  caste: string[]=[];
  private religionOptions: MetadataOption[] = [];

  showInterests:boolean=false;

  interestedUserProfiles: UserProfile[]=[];
  profilesInterestedInUser: UserProfile[]=[];
  interestView: 'byUser' | 'inUser' = 'byUser';

  setInterestView(view: 'byUser' | 'inUser') {
    this.interestView = view;
    this.currentPage = 1;
  }
  constructor(private userService: UserserviceService, private router: Router,public auth:AuthService,private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
        const isInterests = urlSegments.some(seg => seg.path === 'user-interests');
        this.showInterests = isInterests;
      });
      
    this.loadPagedUsers();

    this.userService.getMetaData().subscribe({
         next:( data:MetaDataResponse) => {
            this.religions = data.religions;
            this.maritalStatuses = data.maritalStatuses;
            this.genders = data.genders;
            this.caste = data.castes ?? [];

            this.userService.getMetadataOptions('religion').subscribe({
              next: (options) => this.religionOptions = options,
              error: (error) => console.error('Error loading religion option IDs:', error)
            });
            console.log("get meta data api triggered");
          },
          error: (error) => {
            console.error('Error fetching metadata:', error);
          }
      });

      this.userService.getInterestedProfiles(this.auth.getUserId()).subscribe(
        (response:any)=>
        {
          this.interestedUserProfiles = response?.profilesInterestedByUser;
          this.profilesInterestedInUser = response?.profilesInterestedInUser;
          console.log("get interested profile api triggered");
          
        },
        (error:any)=>
        {
          console.error('Error fetching user interests profiles:', error);
        }
          
      );
  }

  private loadImagesForUsers(users: UserProfile[]) {
    if (!users.length) {
      this.userImagesMap = {};
      this.activeImageIndexMap = {};
      return;
    }

    const imageRequests = users.map(user =>
      this.userService.getUserImages(user.id)
    );

    forkJoin(imageRequests).subscribe({
      next: (imagesByUser) => {
        const imageMap: Record<number, UserPhoto[]> = {};
        const indexMap: Record<number, number> = {};

        users.forEach((user, idx) => {
          const images = imagesByUser[idx] ?? [];
          imageMap[user.id] = images;
          indexMap[user.id] = 0;
        });

        this.userImagesMap = imageMap;
        this.activeImageIndexMap = indexMap;
      },
      error: (error) => {
        console.error('Error fetching user images:', error);
      }
    });
  }

  // use absolute path to avoid relative-route 404s (e.g. /user-details/...)
  defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMGUwZTAiLz4KICAKICA8IS0tIEhlYWQgLS0+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNzAiIHI9IjM1IiBmaWxsPSIjOTk5Ii8+CiAgCiAgPCEtLSBCb2R5IC0tPgogIDxwYXRoIGQ9Ik0gNjUgMTA1IFEgNjUgMTEwIDcwIDExMCBMIDEzMCAxMTAgUSAxMzUgMTEwIDEzNSAxMDUgTCAxMzUgMTcwIFEgMTM1IDE3NSAxMzAgMTc1IEwgNzAgMTc1IFEgNjUgMTc1IDY1IDE3MCBaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPg==';

  getCardImageUrl(userId: number): string {
    const images = this.userImagesMap[userId] ?? [];
    if (!images.length) {
      return this.defaultAvatarUrl;
    }

    const currentIndex = this.activeImageIndexMap[userId] ?? 0;
    return images[currentIndex]?.url || images[0]?.url || this.defaultAvatarUrl;
  }

  onCardPhotoError(event: any) {
    const img = event?.target as HTMLImageElement | undefined;
    if (!img) return;
    // Avoid re-setting fallback repeatedly (prevents flicker/shaking)
    if (img.dataset && img.dataset['fallback'] === '1') return;
    img.onerror = null;
    img.dataset['fallback'] = '1';
    img.src = this.defaultAvatarUrl;
  }

  getImageCount(userId: number): number {
    return this.userImagesMap[userId]?.length ?? 0;
  }

  getCurrentImagePosition(userId: number): number {
    const imageCount = this.getImageCount(userId);
    if (!imageCount) return 0;
    return (this.activeImageIndexMap[userId] ?? 0) + 1;
  }

  prevImage(userId: number, event: Event) {
    event.stopPropagation();
    const images = this.userImagesMap[userId] ?? [];
    if (images.length <= 1) return;

    const currentIndex = this.activeImageIndexMap[userId] ?? 0;
    this.activeImageIndexMap[userId] = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  }

  nextImage(userId: number, event: Event) {
    event.stopPropagation();
    const images = this.userImagesMap[userId] ?? [];
    if (images.length <= 1) return;

    const currentIndex = this.activeImageIndexMap[userId] ?? 0;
    this.activeImageIndexMap[userId] = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
  }
  filteredUsers(): UserProfile[] {
    if (!this.showInterests) {
      return this.users;
    }

    let filtered = this.showInterests
  ?(this.interestView === 'byUser')?this.interestedUserProfiles ?? []: this.profilesInterestedInUser ?? []
  : this.users;

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(u =>
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search)
      );
    }

    if (this.selectedGender) {
      filtered = filtered.filter(u => u.gender === this.selectedGender);
    }

    if (this.selectedReligion) {
      filtered = filtered.filter(u => u.religion === this.selectedReligion);
    }

    if (this.selectedCaste) {
      filtered = filtered.filter(u => (u.caste).toLowerCase().includes(this.selectedCaste.toLowerCase()));
    }

    if (this.selectedMaritalStatus) {
      filtered = filtered.filter(u => u.maritalStatus === this.selectedMaritalStatus);
    }

    return filtered;
  }

  onFiltersChanged() {
    this.currentPage = 1;
    if (!this.showInterests) {
      this.loadPagedUsers();
    }
  }

  get totalFilteredUsers(): number {
    if (!this.showInterests) {
      return this.totalUsersCount;
    }
    return this.filteredUsers().length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredUsers / this.pageSize));
  }

  paginatedUsers(): UserProfile[] {
    if (!this.showInterests) {
      return this.users;
    }

    const filtered = this.filteredUsers();
    const safeCurrentPage = Math.min(this.currentPage, this.totalPages);
    const startIndex = (safeCurrentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    if (this.currentPage === page) {
      return;
    }
    this.currentPage = page;
    if (!this.showInterests) {
      this.loadPagedUsers();
    }
    this.scrollToListTop();
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  onReligionFilterChange() {
    this.onFiltersChanged();
    this.selectedCaste = '';

    if (!this.selectedReligion) {
      this.userService.getMetaData().subscribe({
        next: (data) => this.caste = data.castes ?? [],
        error: (error) => console.error('Error loading all castes:', error)
      });
      return;
    }

    const selectedReligion = this.religionOptions.find(option => option.name === this.selectedReligion);
    if (!selectedReligion?.id) {
      this.caste = [];
      return;
    }

    this.userService.getMetadataOptions('caste', selectedReligion.id).subscribe({
      next: (options) => this.caste = options.map(option => option.name),
      error: (error) => console.error('Error loading castes by religion:', error)
    });
  }

  deleteUser(userId: any) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUserProfile(userId).subscribe(
        (response) => {
          console.log(`User ${userId} deleted successfully`);
          alert('User deleted successfully');
          this.router.navigate(['user-list']);
          
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  addUserToInterestedProfile(userId: any)
  {
    this.userService.addUserToInterestedProfile(this.auth.getUserId(),userId).subscribe(
      (response)=>
      {
        const selectedUser = this.users.find(user => user.id === userId);
        if (selectedUser && !this.isUserInterested(userId)) {
          this.interestedUserProfiles = [...(this.interestedUserProfiles ?? []), selectedUser];
        }
        this.refreshInterestedProfiles();
        console.log(`User added to interested to profile success fully`);
      },
      (error)=>
      {
        console.error("Error while adding user to interested profiles");
      }
    );
  }
  isUserInterested(userId: number): boolean {
    return (this.interestedUserProfiles ?? []).some(u => u.id === userId);
  }

  removeUserFromInterestedProfile(userId: number) 
  {
    this.userService.removeUserFromInterestedProfile(this.auth.getUserId(), userId).subscribe(
      (response) => {
        this.interestedUserProfiles = (this.interestedUserProfiles ?? []).filter(user => user.id !== userId);
        this.refreshInterestedProfiles();
        console.log('User removed from interested profiles');
      },
      (error) => {
        console.error('Error removing user from interested profiles', error);
      }
    );
  }

  private refreshInterestedProfiles() {
    this.userService.getInterestedProfiles(this.auth.getUserId()).subscribe(
      (response: any) => {
        this.interestedUserProfiles = response?.profilesInterestedByUser ?? [];
        this.profilesInterestedInUser = response?.profilesInterestedInUser ?? [];
      },
      (error: any) => {
        console.error('Error fetching user interests profiles:', error);
      }
    );
  }
  UpdateShowInterests()
  {
    this.showInterests = !this.showInterests;
    this.currentPage = 1;
    if (!this.showInterests) {
      this.loadPagedUsers();
    }
  }
  trackByUserId(index: number, user: UserProfile) {
     return user.id;
  }

  calculateAge(birthDate: string | Date): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  toggleInterest(userId: number) {
  if (this.isUserInterested(userId)) {
    this.removeUserFromInterestedProfile(userId);
  } else {
    this.addUserToInterestedProfile(userId);
  }
}
  isFilterVisible: boolean = false; // New variable for mobile toggle

  toggleFilters() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  private scrollToListTop() {
    setTimeout(() => {
      this.listTop?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  private loadPagedUsers() {
    const query: UserListQuery = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchText?.trim() || undefined,
      gender: this.selectedGender || undefined,
      religion: this.selectedReligion || undefined,
      caste: this.selectedCaste || undefined,
      maritalStatus: this.selectedMaritalStatus || undefined
    };

    this.userService.getUsersProfiles(query).subscribe(
      (response) => {
        this.users = response.items ?? [];
        this.totalUsersCount = response.totalCount ?? 0;
        this.currentPage = response.page ?? this.currentPage;
        this.pageSize = response.pageSize ?? this.pageSize;
        this.loadImagesForUsers(this.users);
        console.log("get user profiles pagination api triggered");
      },
      (error) => {
        console.error('Error fetching paged user profiles:', error);
      }
    );
  }
}
