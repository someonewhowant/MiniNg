import { Injectable } from '../decorators/injectable';
import { Renderer, ComponentRef } from '../renderer/renderer';

export interface Route {
  path: string;
  component: new (...args: any[]) => any;
}

@Injectable()
export class Router {
  private routes: Route[] = [];
  private outletElement: HTMLElement | null = null;
  private currentComponentRef: ComponentRef | null = null;

  configure(routes: Route[]): void {
    this.routes = routes;
    window.addEventListener('hashchange', () => this.onHashChange());
    // Initial render
    queueMicrotask(() => this.onHashChange());
  }

  setOutlet(element: HTMLElement): void {
    this.outletElement = element;
    // Trigger render if it was pending
    this.onHashChange();
  }

  private onHashChange(): void {
    if (!this.outletElement) return;

    let hash = window.location.hash.slice(1);
    if (!hash) {
       // if there is an empty route, we could default to the first one, or '' path
       const defaultRoute = this.routes.find(r => r.path === '');
       if (defaultRoute) hash = '';
       else hash = this.routes[0]?.path || '';
       
       if (window.location.hash !== `#${hash}`) {
         window.location.hash = `#${hash}`;
         return; // it will trigger hashchange again
       }
    }

    const route = this.routes.find(r => r.path === hash);
    if (route) {
      this.renderRoute(route);
    } else {
      console.warn(`Route not found for path: ${hash}`);
    }
  }

  private renderRoute(route: Route): void {
    // Destroy previous
    if (this.currentComponentRef) {
      this.currentComponentRef.destroy();
      this.currentComponentRef = null;
    }

    if (this.outletElement) {
        this.outletElement.innerHTML = ''; // clear just in case
        this.currentComponentRef = Renderer.render(route.component, this.outletElement);
    }
  }

  navigate(path: string): void {
    window.location.hash = `#${path}`;
  }
}
