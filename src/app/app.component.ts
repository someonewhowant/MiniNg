import { Component } from '@core';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1>{{ title }}</h1>
      <p>Count: {{ count }}</p>
      <button (click)="increment()">+1</button>
      <button (click)="reset()">Reset</button>
    </div>
  `
})
export class AppComponent {
  title = 'MiniNG Framework - Reactivity';
  count = 0;

  increment() {
    this.count++;
  }

  reset() {
    this.count = 0;
  }
}
