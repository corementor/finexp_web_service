import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
// import logoImage from '../../assets/imgs/logo-icon.png';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMenuOpen = false;
  isNotificationsOpen = false;
  notifications = 5;
  logo = '../../assets/imgs/logo-icon.png';
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }
}
