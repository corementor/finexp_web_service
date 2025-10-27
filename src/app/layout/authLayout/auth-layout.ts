import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="auth-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        width: 100%;
        height: 100vh;
        overflow: auto;
      }
    `,
  ],
})
export class AuthLayout {}
