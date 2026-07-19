import { Component, OnInit } from '@core';
import { ProductService } from './services/product.service';
import type { Product } from './services/product.service';
import { ProductCardComponent } from './components/product-card.component';

@Component({
  selector: 'app-root',
  declarations: [ProductCardComponent],
  template: `
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1>Mini Shop 🛒</h1>
      
      <div style="margin-bottom: 1rem;">
         <button (click)="applyDiscount()">Сделать скидку (OnChanges)</button>
         <button (click)="removeFirstProduct()">Удалить первый товар (OnDestroy)</button>
      </div>

      <div class="product-list" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <product-card *ngFor="let product of products" [product]="product" (addToCart)="addToCart($event)"></product-card>
      </div>
      
      <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px;">
        <h3>Корзина (Товаров: {{ cartCount }})</h3>
        <ul>
          <li *ngFor="let item of cart">
            {{ item.name }} - {{ item.price }} $
            <button (click)="removeFromCart(item)" style="margin-left: 1rem; color: red;">Удалить</button>
          </li>
        </ul>
        <p *ngIf="isCartEmpty">Корзина пуста</p>
      </div>

      <div style="margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem;">
        <h3>Тест двустороннего связывания [(ngModel)]</h3>
        <input [(ngModel)]="searchQuery" placeholder="Search..." />
        <p>Ищем: {{ searchQuery }}</p>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  products: Product[] = [];
  cart: Product[] = [];
  cartCount = 0;
  searchQuery = '';

  get isCartEmpty()  {
    return this.cartCount === 0;
  }

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products = this.productService.getAll();
  }

  applyDiscount() {
    if (this.products.length > 0) {
      // Reassign to trigger OnChanges (object reference change)
      this.products[0] = { ...this.products[0], price: 9.99 };
    }
  }

  removeFirstProduct() {
    if (this.products.length > 0) {
      // Trigger Array Proxy splice -> DOM cleanup -> OnDestroy
      this.products.splice(0, 1);
    }
  }

  addToCart(product: Product) {
    this.cart.push(product); // Это должно вызвать перерисовку списка корзины (Proxy push)
    this.cartCount = this.cart.length;
  }

  removeFromCart(product: Product) {
    const index = this.cart.indexOf(product);
    if (index !== -1) {
      this.cart.splice(index, 1); // Мутация сплайсом
      this.cartCount = this.cart.length;
    }
  }
}

