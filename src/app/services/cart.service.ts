import { Injectable } from '@core';
import type { Product } from './product.service';

@Injectable()
export class CartService {
  private cart: Product[] = [];

  add(product: Product) {
    this.cart.push(product);
  }

  remove(product: Product) {
    const index = this.cart.indexOf(product);
    if (index !== -1) {
      this.cart.splice(index, 1);
    }
  }

  getAll(): Product[] {
    return this.cart;
  }

  get count(): number {
    return this.cart.length;
  }
}
