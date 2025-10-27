import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { ToasterComponent } from './components/toaster/toaster.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // MainLayout,
    ToasterComponent,
    RouterOutlet,
  ],
  template: `
    <!-- <app-main-layout></app-main-layout> -->
    <router-outlet></router-outlet>
    <app-toaster></app-toaster>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'FinExp';
}
