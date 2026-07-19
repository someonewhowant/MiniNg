import { Component, Input, Output, EventEmitter } from '@core';
import type { Product } from '../services/product.service';
import type { OnInit, OnChanges, OnDestroy, AfterViewInit, SimpleChanges } from '@core';

@Component({
  selector: 'product-card',
  template: `
    <div style="border: 1px solid #ccc; padding: 1rem; border-radius: 8px;">
      <h3>{{ product.name }}</h3>
      <p style="color: green; font-weight: bold;">{{ product.price }} $</p>
      <button (click)="onAddToCart()">В корзину</button>
    </div>
  `
})
export class ProductCardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  ngOnInit() {
    console.log(`[ProductCard] OnInit: ${this.product.name} initialized`);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(`[ProductCard] OnChanges for ${this.product.name}:`, changes);
  }

  ngAfterViewInit() {
    console.log(`[ProductCard] AfterViewInit: ${this.product.name} view rendered`);
  }

  ngOnDestroy() {
    console.log(`[ProductCard] OnDestroy: ${this.product.name} removed from DOM 🗑️`);
  }

  onAddToCart() {
    this.addToCart.emit(this.product);
  }
}
