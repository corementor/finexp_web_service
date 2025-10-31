import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDTO } from '../../../../common/dto/usermanagement/user-dto';
import { RoleDTO } from '../../../../common/dto/usermanagement/role-dto';
import { UserService } from '../user-service/user-service';
import { ToasterService } from '../../../../services/toaster.service';
import { AuthService } from '../../security/service/auth-service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser implements OnInit {
  user: UserDTO = new UserDTO();
  availableRoles: RoleDTO[] = [];
  selectedRoleIds: string[] = [];
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  confirmPassword = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private toaster: ToasterService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.userService.findAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        this.toaster.success('Roles', 'Loaded available roles successfully');
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.toaster.error('Error', 'Failed to load roles');
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  toggleRole(roleId: string) {
    const index = this.selectedRoleIds.indexOf(roleId);
    if (index > -1) {
      this.selectedRoleIds.splice(index, 1);
    } else {
      this.selectedRoleIds.push(roleId);
    }
  }

  validateForm(): boolean {
    if (!this.user.firstName || this.user.firstName.trim() === '') {
      this.toaster.warning('Validation Error', 'First name is required');
      return false;
    }

    if (!this.user.lastName || this.user.lastName.trim() === '') {
      this.toaster.warning('Validation Error', 'Last name is required');
      return false;
    }

    if (!this.user.email || this.user.email.trim() === '') {
      this.toaster.warning('Validation Error', 'Email is required');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.toaster.warning('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!this.user.phoneNumber || this.user.phoneNumber.trim() === '') {
      this.toaster.warning('Validation Error', 'Phone number is required');
      return false;
    }

    if (!this.user.password || this.user.password.trim() === '') {
      this.toaster.warning('Validation Error', 'Password is required');
      return false;
    }

    if (this.user.password.length < 6) {
      this.toaster.warning('Validation Error', 'Password must be at least 6 characters');
      return false;
    }

    if (this.user.password !== this.confirmPassword) {
      this.toaster.warning('Validation Error', 'Passwords do not match');
      return false;
    }

    if (this.selectedRoleIds.length === 0) {
      this.toaster.warning('Validation Error', 'Please select at least one role');
      return false;
    }

    return true;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.user.createdBy = this.authService.getCurrentUser()?.fullName;
    // Map selected role IDs to RoleDTO objects
    this.user.role = this.selectedRoleIds.map((roleId) => {
      const role = this.availableRoles.find((r) => r.id === roleId);
      return {
        id: roleId,
        createdAt: role?.createdAt,
      } as RoleDTO;
    });

    this.userService.createUser(this.user).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status >= 200 && response.status < 300) {
          this.toaster.success('Success', 'User created successfully');
          this.router.navigate(['/usermanagement/list']);
        } else {
          this.toaster.error('Error', response.body?.message || 'Failed to create user');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating user:', error);
        this.toaster.error('Error', error.message || 'Failed to create user');
      },
    });
  }

  onCancel() {
    this.router.navigate(['/usermanagement/list']);
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
}
