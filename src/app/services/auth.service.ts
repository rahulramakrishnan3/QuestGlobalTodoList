import { Injectable } from '@angular/core';

const AUTH_KEY = 'isLoggedIn';
const USERNAME_KEY = 'username';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(USERNAME_KEY, username);
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }

  getUsername(): string {
    return localStorage.getItem(USERNAME_KEY) ?? 'User';
  }
}
