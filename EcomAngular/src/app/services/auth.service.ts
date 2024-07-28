import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<string | null>;
  public currentUser: Observable<string | null>;
  public apiUrl = 'http://localhost:5197'; 
  private userRoleSubject = new BehaviorSubject<string>('');
  userRole$: Observable<string> = this.userRoleSubject.asObservable();

  isAdmin$: Observable<boolean> = this.userRole$.pipe(map(role => role === 'Admin'));
  isCustomer$: Observable<boolean> = this.userRole$.pipe(map(role => role === 'Customer'));

  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isAuthenticated());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<string | null>(
      localStorage.getItem('currentUser')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }
  
  getUserId(): number | null {
    return Number(localStorage.getItem('user'));
  }

  register(userName: string, password: string, userRole: string, email: string, mobileNumber: string): Observable<any> {
    const body = { userName, password, userRole, email, mobileNumber };
    return this.http.post<any>(`${this.apiUrl}/api/register`, body);
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/api/check-email/${email}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(false);
        } else {
          throw error;
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): Observable<string> {
    return this.userRole$;
  }
  getUserRoleSync(): string | null {
    return localStorage.getItem('userRole');
  }

  private storeUserData(user: any): void {
    localStorage.setItem('userToken', user.token);
    localStorage.setItem('userRole', user.userRole);
    localStorage.setItem('user', user.userId);
    console.log('The userId' + localStorage.getItem('user'));
    console.log('The user role' + localStorage.getItem('userRole'));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    return this.http.post<any>(`${this.apiUrl}/api/login`, loginData)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', response.username);
            localStorage.setItem('userRole', response.userRole);
            localStorage.setItem('user', response.userId);

            this.userRoleSubject.next(response.userRole);
            this.isAuthenticatedSubject.next(true);
            this.storeUserData(response);

            if (response.userRole === 'Admin' || response.userRole === 'Customer') {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/login']);
            }
          } else {
            console.error('Invalid login response:', response);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');

    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; 
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin') {
          return true;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return localStorage.getItem('userRole') === 'Admin';
  }

  isCustomer(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if(decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Customer'){
          return true;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return localStorage.getItem('userRole') === 'Customer';
  }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
