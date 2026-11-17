
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly route = inject(ActivatedRoute);

  private readonly fb = inject(FormBuilder);

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  showPassword = false;

  isLoading = false;

  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({

     next: () => {
  this.isLoading = false;

  const returnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl');

  this.router.navigateByUrl(
    this.getSafeReturnUrl(returnUrl)
  );
},

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please try again.';
        } else {
          this.errorMessage =
            error.error?.message || 'Login failed. Please try again.';
        }
      }

    });
  }

  private getSafeReturnUrl(returnUrl: string | null): string {

  if (
    !returnUrl ||
    !returnUrl.startsWith('/') ||
    returnUrl.startsWith('//') ||
    returnUrl.startsWith('/login')
  ) {
    return '/dashboard';
  }

  return returnUrl;
}
}
