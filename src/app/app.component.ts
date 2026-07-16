import { Component } from '@core';
import { CounterService } from './services/counter.service';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1>{{ title }}</h1>
      <p>Count from DI Service: {{ count }}</p>
      <button (click)="increment()">+1</button>
    </div>
  `
})
export class AppComponent {
  title = 'MiniNG Framework - DI';
  count = 0;

  constructor(private counterService: CounterService) {
    this.count = this.counterService.getValue();
  }

  increment() {
    this.count = this.counterService.increment();
  }
}
