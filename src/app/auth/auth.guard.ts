import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const now = Date.now().valueOf() / 1000;
      if (decoded.exp < now) {
        localStorage.removeItem('token');
        alert('Session Expired! Need to login again');
        this.router.navigate(['/auth/login']);
        return false;
      }
      return true;
    }
    alert('Unauthorized access! Please log in first.');
    this.router.navigate(['/auth/login']);
    return false;
  }
}
