import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayout],
  template: `<app-main-layout></app-main-layout>`,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'FinExp';
}
