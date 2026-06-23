import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface User {
  id: number;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  currentUser = signal<User | null>(this.getUserFromLocalStorage());
  isAuthenticated = signal<boolean>(!!this.getToken());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(email: string, password: string, role: string = 'user'): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password, role }).pipe(
      tap((response) => {
        console.log('Registration successful', response);
      }),
      catchError((error) => {
        console.error('Registration error', error);
        return throwError(() => error);
      }),
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      }),
      catchError((error) => {
        console.error('Login error', error);
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getUserFromLocalStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUser()?.role === 'user';
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
