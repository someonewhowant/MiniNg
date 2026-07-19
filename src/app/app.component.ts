import { Component, OnInit } from '@core';
import { ProductService, Product } from './services/product.service';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1>Mini Shop 🛒</h1>
      
      <div class="product-list" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <div class="card" *ngFor="let product of products" style="border: 1px solid #ccc; padding: 1rem; border-radius: 8px;">
          <h3>{{ product.name }}</h3>
          <p>{{ product.price }} $</p>
          <button (click)="addToCart(product)">В корзину</button>
        </div>
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
        <h3>Тест ввода ($event)</h3>
        <input (input)="onInput($event)" placeholder="Search..." />
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

  get isCartEmpty() {
    return this.cartCount === 0;
  }

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products = this.productService.getAll();
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

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }
}

