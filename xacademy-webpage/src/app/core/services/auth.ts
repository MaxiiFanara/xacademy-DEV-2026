import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User, LoginDto, RegisterDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

private readonly API = '/api/auth';
  private currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getUser() {
    return this.currentUser;
  }

  checkSession() {
    return this.http.get<User>(`${this.API}/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  login(dto: LoginDto) {
    return this.http.post<{ user: User }>(
      `${this.API}/login`,
      dto,
      { withCredentials: true }
    ).pipe(
      tap(res => this.currentUser.set(res.user))
    );
  }

  register(dto: RegisterDto) {
    return this.http.post(
      `${this.API}/register`,
      dto,
      { withCredentials: true }
    );
  }

  logout() {
    return this.http.post(
      `${this.API}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }
}