import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css']
})
export class ViewProductComponent implements OnInit {
  products: Product[];
  selectedProduct: Product;
  userRole: string;
  editModeMap: { [key: number]: boolean } = {}; 

  constructor(private productService: ProductService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.getAllProducts();
    this.userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.authService.decodeToken(token);
      if (decodedToken) {
        this.userRole = decodedToken.role;
      }
    }
  }

  updateProduct(product: Product): void {
    if (!product.productId) {
      console.error('Product ID is undefined.');
      console.log('Product Object:', product); 
      return;
    }
    if (this.userRole !== 'Admin') {
      console.error('Access denied. Only admins can update products.');
      return;
    }

    const updatedData: Product = { ...product };
    updatedData.name = product.name;
    updatedData.description = product.description;
    updatedData.price = product.price;
    updatedData.category = product.category;
    if (Product == null) {
      alert('Cannot give empty or null values');}
    this.productService.updateProduct(product.productId, updatedData).subscribe(
      () => {
        console.log('Product updated successfully.');
        this.getAllProducts();
      },
      (error) => {
        console.error('Error updating product:', error);
      }
    );
  }

  toggleEditMode(product: Product): void {
    this.selectedProduct = this.selectedProduct === product ? null : product;
  }

  getAllProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
      products.forEach(product => this.editModeMap[product.productId] = false);
    });
  }

  editProduct(product: Product): void {
    if (this.userRole !== 'Admin') {
      console.error('Access denied. Only admins can edit products.');
      return;
    }
    this.editModeMap[product.productId] = !this.editModeMap[product.productId];

    this.selectedProduct = product;
  }

  deleteProduct(product: Product): void {
    console.log('Deleting product:', product);

    if (this.productService.deleteProduct) {
      this.productService.deleteProduct(product.productId).subscribe(() => {
        this.getAllProducts();
      });
    } else {
      console.error('deleteProduct method not found in ProductService');
    }
  }

  cancelEdit(): void {
    this.editModeMap[this.selectedProduct.productId] = false;
    this.selectedProduct = null;
  }
}
