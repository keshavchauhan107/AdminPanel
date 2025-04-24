import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor() {}

  login(userData: any,token:string) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
}
