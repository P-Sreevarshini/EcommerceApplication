import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        if (response && response.token) {
          this.authService.decodeToken(response.token);
          if (this.authService.isAdmin() || this.authService.isCustomer() ) {
            alert('Login Successful');
            this.router.navigate(['/home']); 
          } else {
            this.router.navigate(['/login']); 
          }
        } else {
          this.error = 'Login failed. Please try again.';
        }
      },
      (error) => {
        this.error = error.status === 500
          ? 'Account not found. Please check your email and password.'
          : 'Invalid email or password.';
      }
    );
  }

  goToRegistrationPage(): void {
    this.router.navigate(['/signup']);
  }
}
