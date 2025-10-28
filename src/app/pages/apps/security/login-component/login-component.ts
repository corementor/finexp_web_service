import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../../../services/toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth-service';

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
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private authService: AuthService
  ) {
    this.loginForm = this.createForm();

    // Get return URL from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
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
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.toaster.success('Welcome!', response.message || 'Login successful');
          // Navigate to the return URL or dashboard
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage = error.error?.message || 'Invalid email or password';
          this.toaster.error('Login Failed', errorMessage);
        },
      });
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
