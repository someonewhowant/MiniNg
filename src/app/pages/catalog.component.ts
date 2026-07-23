import { Component, OnInit } from '@core';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ProductCardComponent } from '../components/product-card.component';

@Component({
  selector: 'page-catalog',
  declarations: [ProductCardComponent],
  template: `
    <div>
      <h2>Каталог товаров</h2>
      <div style="margin-bottom: 1rem;">
         <button (click)="applyDiscount()">Сделать скидку первой позиции</button>
      </div>
      <div class="product-list" style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <product-card *ngFor="let product of products" [product]="product" (addToCart)="addToCart($event)"></product-card>
      </div>
    </div>
  `
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService, private cartService: CartService) {}

  ngOnInit() {
    this.products = this.productService.getAll();
  }

  applyDiscount() {
    if (this.products.length > 0) {
      this.products[0] = { ...this.products[0], price: 9.99 };
    }
  }

  addToCart(product: Product) {
    this.cartService.add(product);
  }
}
