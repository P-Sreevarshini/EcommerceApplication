import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode'; 

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  public tokenKey = 'jwtToken';

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.decodeToken(token); 
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token); 
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  getUserRole(): string {
    const token = this.getToken();
    if (!token) return '';
    const decodedToken = this.decodeToken(token);
    return decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameid'] || null;
    }
    return null;
  }

  getUserName(): string {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/name'] || '';
    }
    return '';
  }
}
