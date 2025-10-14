import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private idCounter = 0;

  success(title: string, message: string, duration = 3000) {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration = 5000) {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration = 4000) {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration = 3000) {
    this.show('info', title, message, duration);
  }

  private show(type: Toast['type'], title: string, message: string, duration: number) {
    const toast: Toast = {
      id: ++this.idCounter,
      type,
      title,
      message,
      duration,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  remove(id: number) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter((toast) => toast.id !== id));
  }
}