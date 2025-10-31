import { Component, OnInit } from '@angular/core';
import { UserDTO } from '../../../../common/dto/usermanagement/user-dto';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterService } from '../../../../services/toaster.service';
import { UserService } from '../user-service/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './list-user.html',
  styleUrl: './list-user.css',
})
export class ListUser implements OnInit {
  usersList: UserDTO[] = [];
  isLoading = false;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  sortColumn: string = 'saleDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  dateFilter: string = '';
  Math = Math;

  showDeleteModal = false;
  userToDelete?: UserDTO;
  isDeleting = false;

  openDropdownIndex: number | null = null;

  constructor(
    private toaster: ToasterService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.usersList = response;
        this.isLoading = false;
        this.toaster.success('Users', `Loaded ${this.usersList.length} users successfully`);
      },
      error: (error) => {
        this.toaster.error('Error', 'Failed to load users');
        console.error('Error loading users:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Get user's primary role name
   */
  getUserRoleName(user: UserDTO): string {
    if (user.role && user.role.length > 0 && user.role[0].roleName) {
      return user.role[0].roleName;
    }
    return 'N/A';
  }

  /**
   * Get all role names for a user (in case of multiple roles)
   */
  getUserRoleNames(user: UserDTO): string {
    if (user.role && user.role.length > 0) {
      return user.role.map((r) => r.roleName).join(', ');
    }
    return 'N/A';
  }

  /**
   * Get role badge color class
   */
  getRoleBadgeClass(roleName: string): string {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'STOCK_OFFICER':
        return 'bg-blue-100 text-blue-800';
      case 'MANAGER':
        return 'bg-green-100 text-green-800';
      case 'USER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  createNewUser() {
    this.router.navigate(['/usermanagement/create-user']);
  }

  clearFilters() {
    this.searchTerm = '';
    this.dateFilter = '';
    this.currentPage = 1;
    this.toaster.info('Filters Cleared', 'All filters have been reset');
  }

  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.toaster.info('Sorting', `Sorted by ${column} (${this.sortDirection}ending)`);
  }

  get paginatedUsers(): UserDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get filteredUsers(): UserDTO[] {
    let filtered = [...this.usersList];

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(term) ||
          user.lastName?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phoneNumber?.toLowerCase().includes(term) ||
          this.getUserRoleName(user).toLowerCase().includes(term) // Add role search
      );
    }

    // Apply date filter
    if (this.dateFilter) {
      filtered = filtered.filter((user) => user.createdAt?.substring(0, 10) === this.dateFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortColumn) {
        case 'firstName':
          comparison = (a.firstName || '').localeCompare(b.firstName || '');
          break;
        case 'createdAt':
          comparison =
            new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
        case 'lastName':
          comparison = (a.lastName || '').localeCompare(b.lastName || '');
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'phoneNumber':
          comparison = (a.phoneNumber || '').localeCompare(b.phoneNumber || '');
          break;
        case 'role':
          // Sort by role name
          comparison = this.getUserRoleName(a).localeCompare(this.getUserRoleName(b));
          break;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  toggleDropdown(index: number) {
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }

  viewUserDetails(user: UserDTO) {
    this.openDropdownIndex = null; // Close dropdown
    this.router.navigate(['/usermanagement/view-user'], {
      state: {
        user: user,
      },
    });
  }

  deleteUser(user: UserDTO) {
    this.openDropdownIndex = null; // Close dropdown
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = undefined;
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.isDeleting = true;
    this.userService.deleteUser(this.userToDelete).subscribe({
      next: (response) => {
        this.isDeleting = false;
        if (response.status >= 200 && response.status < 300) {
          this.toaster.success('Success', 'User deleted successfully');
          this.closeDeleteModal();
          // Reload users list
          this.loadUsers();
        } else {
          this.toaster.error('Error', response.body?.message || 'Failed to delete user');
          this.closeDeleteModal();
        }
      },
      error: (error) => {
        this.isDeleting = false;
        console.error('Error deleting user:', error);
        this.toaster.error('Error', error.message || 'Failed to delete user');
        this.closeDeleteModal();
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }
}
