import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../pages/apps/security/service/auth-service';
import { AuthResponse } from '../../common/dto/util/auth-response';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isMenuOpen = false;
  isNotificationsOpen = false;
  isUserMenuOpen = false;
  notifications = 3;
  currentUser: AuthResponse | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isUserMenuOpen = false; // Close user menu when opening notifications
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isNotificationsOpen = false; // Close notifications when opening user menu
  }

  logout() {
    this.isUserMenuOpen = false;
    this.isMenuOpen = false;
    this.authService.logout();
  }

  // Get user's full name or email
  getUserDisplayName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || 'User';
  }

  // Get user's email
  getUserEmail(): string {
    return this.currentUser?.email || 'user@finxp.com';
  }

  // Get user's role
  getUserRole(): string {
    return this.currentUser?.role || 'User';
  }

  // Get user's initials for avatar
  getUserInitials(): string {
    if (this.currentUser?.fullName) {
      const names = this.currentUser.fullName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    if (this.currentUser?.email) {
      return this.currentUser.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }
}
