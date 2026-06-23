import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email    = signal('');
  password = signal('');
  isLoading    = signal(false);
  errorMessage = signal('');
  isSignUp     = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  onSubmit(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.isSignUp()) {
      this.authService.register(this.email(), this.password(), 'user').subscribe({
        next: () => {
          this.isLoading.set(false);
          this.email.set('');
          this.password.set('');
          this.isSignUp.set(false);
          this.errorMessage.set(this.translate.instant('AUTH.REGISTER_SUCCESS'));
        },
        error: (error) => {
          this.isLoading.set(false);
          const backendMsg = error.error?.message?.toLowerCase() || '';

          if (backendMsg.includes('exists') || backendMsg.includes('duplicate') || backendMsg.includes('already')) {
            this.errorMessage.set(this.translate.instant('AUTH.EMAIL_EXISTS'));
          } else {
            this.errorMessage.set(this.translate.instant('AUTH.REGISTER_FAILED'));
          }
        },
      });
    } else {
      this.authService.login(this.email(), this.password()).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.email.set('');
          this.password.set('');
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          const backendMsg = error.error?.message?.toLowerCase() || '';

          if (backendMsg.includes('invalid') || backendMsg.includes('credentials') || backendMsg.includes('unauthorized')) {
            this.errorMessage.set(this.translate.instant('AUTH.LOGIN_FAILED'));
          } else if (backendMsg.includes('not found') || backendMsg.includes('user')) {
            this.errorMessage.set(this.translate.instant('AUTH.USER_NOT_FOUND'));
          } else {
            this.errorMessage.set(this.translate.instant('AUTH.LOGIN_FAILED'));
          }
        },
      });
    }
  }

  toggleSignUp(): void {
    this.isSignUp.update((v) => !v);
    this.errorMessage.set('');
  }
}
