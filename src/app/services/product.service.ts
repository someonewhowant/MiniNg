import { Injectable } from '@core';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable()
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'TypeScript Handbook', price: 29 },
    { id: 2, name: 'Angular Stickers', price: 5 },
    { id: 3, name: 'Mechanical Keyboard', price: 120 },
  ];

  getAll(): Product[] {
    return this.products;
  }
}
