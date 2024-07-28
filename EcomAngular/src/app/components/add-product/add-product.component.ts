import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-product',
  templateUrl: 'add-product.component.html',
  styleUrls: ['add-product.component.css']
})
export class AddProductComponent implements OnInit {
  userRole: string | null = null;
  products: Product[] = [];
  newProduct: Product = {
    productId: 0,
    name: '',
    description: '',
    price: 0,
    category: ''
  };
  showProductId: boolean = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole');
    if (this.authService.isAdmin()) {
      this.showProductId = true;
    }
  }

  addProduct(form: NgForm): void {
    if (form.valid) {
      if (!this.newProduct.name || !this.newProduct.description || !this.newProduct.price || !this.newProduct.category) {
        alert('Cannot insert null values in table');
        return;
      }

      console.log(this.newProduct);

      this.productService.saveProduct(this.newProduct).subscribe(
        (product) => {
          this.products.push(product);
          this.newProduct = { productId: 0, name: '', description: '', price: 0, category: '' };
          alert('Product added successfully!');
          this.router.navigate(['/view/Product']);
        },
        (error) => {
          console.error('Error adding product:', error);
          alert('You Do not have Access to Add Products. Contact Admin');

        }
      );
    } else {
      alert('Please fill out all required fields.');
    }
  }
}
