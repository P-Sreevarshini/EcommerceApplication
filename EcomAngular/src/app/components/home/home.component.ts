import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userRole: string | null = null;


  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();  
    this.router.navigate(['/login']);  
  }
  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole');

  }
  isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

}
