import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterService, Toast } from '../../services/toaster.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-4 w-96">
      <div
        *ngFor="let toast of toasts$ | async"
        [class]="getToastClass(toast.type)"
        class="rounded-lg shadow-lg p-4 flex items-start animate-slide-in"
        role="alert"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <svg
            *ngIf="toast.type === 'success'"
            class="h-6 w-6 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <svg
            *ngIf="toast.type === 'error'"
            class="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <svg
            *ngIf="toast.type === 'warning'"
            class="h-6 w-6 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <svg
            *ngIf="toast.type === 'info'"
            class="h-6 w-6 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Content -->
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium" [class]="getTitleClass(toast.type)">
            {{ toast.title }}
          </p>
          <p class="mt-1 text-sm" [class]="getMessageClass(toast.type)">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          (click)="close(toast.id)"
          [class]="getCloseButtonClass(toast.type)"
          class="ml-4 inline-flex flex-shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <span class="sr-only">Close</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
    `,
  ],
})
export class ToasterComponent implements OnInit {
  toasts$: Observable<Toast[]>;

  constructor(private toasterService: ToasterService) {
    this.toasts$ = this.toasterService.toasts$;
  }

  ngOnInit(): void {}

  close(id: number): void {
    this.toasterService.remove(id);
  }

  getToastClass(type: Toast['type']): string {
    const baseClass = 'border-l-4 ';
    switch (type) {
      case 'success':
        return baseClass + 'bg-green-50 border-green-400';
      case 'error':
        return baseClass + 'bg-red-50 border-red-400';
      case 'warning':
        return baseClass + 'bg-yellow-50 border-yellow-400';
      case 'info':
        return baseClass + 'bg-blue-50 border-blue-400';
      default:
        return baseClass + 'bg-gray-50 border-gray-400';
    }
  }

  getTitleClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  }

  getMessageClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  }

  getCloseButtonClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'text-green-500 hover:text-green-600 focus:ring-green-600';
      case 'error':
        return 'text-red-500 hover:text-red-600 focus:ring-red-600';
      case 'warning':
        return 'text-yellow-500 hover:text-yellow-600 focus:ring-yellow-600';
      case 'info':
        return 'text-blue-500 hover:text-blue-600 focus:ring-blue-600';
      default:
        return 'text-gray-500 hover:text-gray-600 focus:ring-gray-600';
    }
  }
}
