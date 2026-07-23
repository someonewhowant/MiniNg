import { Component, Input, Output, EventEmitter } from '@core';
import type { Product } from '../services/product.service';
import type { OnInit, OnChanges, OnDestroy, AfterViewInit, SimpleChanges } from '@core';
import { CurrencyPipe } from '../pipes/currency.pipe';

@Component({
  selector: 'product-card',
  declarations: [CurrencyPipe],
  template: `
    <style>
      .premium-card { box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); }
      .cheap-card { box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .discounted { color: red; text-decoration: underline; }
    </style>
    <div 
      [ngClass]="{ 'premium-card': isPremium(), 'cheap-card': !isPremium() }"
      [ngStyle]="getStyles()"
      style="padding: 1rem; border-radius: 8px; margin-bottom: 1rem; transition: all 0.3s;">
      
      <h3 [ngStyle]="{ 'color': isPremiumColor() }">{{ product.name }}</h3>
      <p [ngClass]="{ 'discounted': isCheap() }" style="font-weight: bold; font-size: 1.2rem;">
        {{ product.price | currency:'USD' }}
      </p>
      
      <button (click)="onAddToCart()" [ngStyle]="getBtnStyles()">
        В корзину
      </button>
    </div>
  `
})
export class ProductCardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  isPremium() { return this.product.price >= 100; }
  isCheap() { return this.product.price < 10; }
  
  isPremiumColor() { return this.isPremium() ? '#d4af37' : '#333'; }

  getStyles() {
    return {
      'border': this.isPremium() ? '2px solid gold' : '1px solid #ccc',
      'background-color': this.isPremium() ? '#fffbe6' : '#fff'
    };
  }

  getBtnStyles() {
    return {
      'background-color': this.isPremium() ? 'gold' : '#007bff',
      'color': this.isPremium() ? '#000' : '#fff',
      'border': 'none',
      'padding': '8px 16px',
      'border-radius': '4px',
      'cursor': 'pointer',
      'font-weight': 'bold'
    };
  }

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
