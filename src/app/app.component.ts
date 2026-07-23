import { Component, OnInit, Router } from '@core';
import { CatalogComponent } from './pages/catalog.component';
import { CartPageComponent } from './pages/cart-page.component';
import { AboutComponent } from './pages/about.component';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
      <nav style="display: flex; gap: 1rem; padding: 1rem; background: #eee; border-radius: 8px; margin-top: 1rem;">
        <a [routerLink]="'catalog'" style="text-decoration: none; color: blue;">Каталог</a>
        <a [routerLink]="'cart'" style="text-decoration: none; color: blue;">Корзина</a>
        <a [routerLink]="'about'" style="text-decoration: none; color: blue;">О магазине</a>
      </nav>

      <div style="padding: 2rem 0;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.configure([
      { path: '', component: CatalogComponent },
      { path: 'catalog', component: CatalogComponent },
      { path: 'cart', component: CartPageComponent },
      { path: 'about', component: AboutComponent },
    ]);
  }
}
