import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';    

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5197/api/Product';

  constructor(private http: HttpClient, private authService: AuthService) {} 

  getAllProducts(): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.get<Product[]>(this.apiUrl, { headers });
  }

  saveProduct(product: Product): Observable<Product> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<Product>(this.apiUrl, product, { headers });
  }

  updateProduct(id: number, product: Product): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.put<void>(`${this.apiUrl}/${id}`, product, { headers });
  }

  deleteProduct(id: number): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
