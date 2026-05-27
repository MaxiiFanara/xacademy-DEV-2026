import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { LoginDto } from '../../../core/models/user.model';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signal para mostrar error del backend
  errorMessage = signal<string | null>(null);

  // Signal para deshabilitar el botón mientras carga
  loading = signal(false);

  loginForm = this.fb.group({
    Email: ['', [Validators.required, Validators.email]],
    Pwd: ['', [Validators.required, Validators.minLength(8)]]
  });

  // Getters para acceder fácilmente a los campos en el template
  get email() { return this.loginForm.get('Email'); }
  get pwd() { return this.loginForm.get('Pwd'); }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const dto = this.loginForm.value as LoginDto;

    this.authService.login(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Credenciales incorrectas');
      }
    });
  }
  goToRegister() {
  this.router.navigate(['/auth/register']);
}
}