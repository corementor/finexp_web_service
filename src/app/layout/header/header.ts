import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMenuOpen = false;
  isNotificationsOpen = false;
  isUserMenuOpen = false; // Add this
  notifications = 3;

  constructor(private router: Router) {} // Add router

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
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');

    // Close the dropdown
    this.isUserMenuOpen = false;

    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }
}
