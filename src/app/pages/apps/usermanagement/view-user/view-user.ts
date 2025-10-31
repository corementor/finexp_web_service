import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDTO } from '../../../../common/dto/usermanagement/user-dto';
import { RoleDTO } from '../../../../common/dto/usermanagement/role-dto';
import { UserService } from '../user-service/user-service';
import { ToasterService } from '../../../../services/toaster.service';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-user.html',
  styleUrl: './view-user.css',
})
export class ViewUser implements OnInit {
  user?: UserDTO;
  availableRoles: RoleDTO[] = [];
  selectedRoleIds: string[] = [];
  isEditing = false;
  isSubmitting = false;
  showPassword = false;
  newPassword = '';
  confirmPassword = '';
  showDeleteModal = false;
  isDeleting = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private toaster: ToasterService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.user = navigation?.extras?.state?.['user'];
  }

  ngOnInit() {
    if (!this.user) {
      this.toaster.warning('Navigation Error', 'No user data found. Redirecting to list...');
      this.router.navigate(['/usermanagement/list']);
      return;
    }
    this.loadRoles();
    // Initialize selected role IDs
    this.selectedRoleIds = this.user.role?.map((r) => r.id!).filter((id) => id) || [];
  }

  loadRoles() {
    this.userService.findAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.toaster.error('Error', 'Failed to load roles');
      },
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset to original data
      this.selectedRoleIds = this.user?.role?.map((r) => r.id!).filter((id) => id) || [];
      this.newPassword = '';
      this.confirmPassword = '';
      this.toaster.info('Edit Cancelled', 'Changes discarded');
    } else {
      this.toaster.info('Edit Mode', 'You can now edit user details');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  toggleRole(roleId: string) {
    if (!this.isEditing) return;

    const index = this.selectedRoleIds.indexOf(roleId);
    if (index > -1) {
      this.selectedRoleIds.splice(index, 1);
    } else {
      this.selectedRoleIds.push(roleId);
    }
  }

  getUserRoleName(user: UserDTO): string {
    if (user.role && user.role.length > 0 && user.role[0].roleName) {
      return user.role[0].roleName;
    }
    return 'N/A';
  }

  getUserRoleNames(user: UserDTO): string {
    if (user.role && user.role.length > 0) {
      return user.role.map((r) => r.roleName).join(', ');
    }
    return 'N/A';
  }

  getRoleBadgeClass(roleName: string): string {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'STOCK_OFFICER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MANAGER':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'USER':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  validateForm(): boolean {
    if (!this.user?.firstName || this.user.firstName.trim() === '') {
      this.toaster.warning('Validation Error', 'First name is required');
      return false;
    }

    if (!this.user?.lastName || this.user.lastName.trim() === '') {
      this.toaster.warning('Validation Error', 'Last name is required');
      return false;
    }

    if (!this.user?.email || this.user.email.trim() === '') {
      this.toaster.warning('Validation Error', 'Email is required');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.toaster.warning('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!this.user?.phoneNumber || this.user.phoneNumber.trim() === '') {
      this.toaster.warning('Validation Error', 'Phone number is required');
      return false;
    }

    // If password is being changed
    if (this.newPassword) {
      if (this.newPassword.length < 6) {
        this.toaster.warning('Validation Error', 'Password must be at least 6 characters');
        return false;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.toaster.warning('Validation Error', 'Passwords do not match');
        return false;
      }
    }

    if (this.selectedRoleIds.length === 0) {
      this.toaster.warning('Validation Error', 'Please select at least one role');
      return false;
    }

    return true;
  }

  onUpdate() {
    if (!this.validateForm() || !this.user) {
      return;
    }

    this.isSubmitting = true;

    // Map selected role IDs to RoleDTO objects
    this.user.role = this.selectedRoleIds.map((roleId) => {
      const role = this.availableRoles.find((r) => r.id === roleId);
      return {
        id: roleId,
        createdAt: role?.createdAt,
      } as RoleDTO;
    });

    // Update password only if new password is provided
    if (this.newPassword) {
      this.user.password = this.newPassword;
    }

    this.userService.updateUser(this.user).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status >= 200 && response.status < 300) {
          this.toaster.success('Success', 'User updated successfully');
          this.isEditing = false;
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.toaster.error('Error', response.body?.message || 'Failed to update user');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating user:', error);
        this.toaster.error('Error', error.message || 'Failed to update user');
      },
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.user) return;

    this.isDeleting = true;
    this.userService.deleteUser(this.user).subscribe({
      next: (response) => {
        this.isDeleting = false;
        if (response.status >= 200 && response.status < 300) {
          this.toaster.success('Success', 'User deleted successfully');
          this.router.navigate(['/usermanagement/list']);
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

  onBack() {
    this.router.navigate(['/usermanagement/list']);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }
}
