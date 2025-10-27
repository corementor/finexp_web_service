import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../../../services/toaster.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router, private toaster: ToasterService) {
    this.loginForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      const { email, password, rememberMe } = this.loginForm.value;

      // TODO: Replace with your authentication service
      // Simulating login for now
      setTimeout(() => {
        this.isSubmitting = false;

        // Simulate successful login
        if (email && password) {
          this.toaster.success('Welcome!', 'Login successful');
          // Navigate to main app (with sidebar)
          this.router.navigate(['/dashboard']);
        } else {
          this.toaster.error('Login Failed', 'Invalid email or password');
        }
      }, 1500);
    } else {
      this.markFormGroupTouched(this.loginForm);
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
