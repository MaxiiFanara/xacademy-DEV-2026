import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RegisterDto } from '../../../core/models/user.model';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  loading = signal(false);

  registerForm = this.fb.group({
    Nombre: ['', [Validators.required, Validators.minLength(2)]],
    Apellido: ['', [Validators.required, Validators.minLength(2)]],
    NombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    Email: ['', [Validators.required, Validators.email]],
    Pwd: ['', [Validators.required, Validators.minLength(8)]]
  });

  get nombre() { return this.registerForm.get('Nombre'); }
  get apellido() { return this.registerForm.get('Apellido'); }
  get nombreUsuario() { return this.registerForm.get('NombreUsuario'); }
  get email() { return this.registerForm.get('Email'); }
  get pwd() { return this.registerForm.get('Pwd'); }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const dto = this.registerForm.value as RegisterDto;

    this.authService.register(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Error al registrarse');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}