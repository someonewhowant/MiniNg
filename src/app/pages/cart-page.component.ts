import { Component, OnInit } from '@core';
import { CartService } from '../services/cart.service';
import type { Product } from '../services/product.service';
import { CurrencyPipe } from '../pipes/currency.pipe';

@Component({
  selector: 'page-cart',
  declarations: [CurrencyPipe],
  template: `
    <div>
      <h2>Ваша корзина ({{ cartCount }})</h2>
      <ul style="list-style: none; padding: 0;">
        <li *ngFor="let item of cartItems" style="padding: 0.5rem; border-bottom: 1px solid #ccc; display: flex; justify-content: space-between;">
          <span>{{ item.name }}</span>
          <span>
            <strong style="color: green;">{{ item.price | currency:'USD' }}</strong>
            <button (click)="removeFromCart(item)" style="margin-left: 1rem; color: red;">Удалить</button>
          </span>
        </li>
      </ul>
      <p *ngIf="isCartEmpty">Корзина пуста</p>
    </div>
  `
})
export class CartPageComponent implements OnInit {
  cartItems: Product[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartItems = this.cartService.getAll();
  }

  get cartCount() {
    return this.cartService.count;
  }

  get isCartEmpty() {
    return this.cartCount === 0;
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }
}
