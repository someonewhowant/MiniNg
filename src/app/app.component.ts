import { Component, OnInit } from '@core';
import { CounterService } from './services/counter.service';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1>{{ title }}</h1>
      
      <div *ngIf="showDetails">
        <p>Secret details revealed!</p>
        <p>Count from DI Service: {{ count }}</p>
      </div>

      <div style="margin: 1rem 0;">
        <input (input)="onInput($event)" placeholder="Type something..." />
        <p>You typed: {{ typedText }}</p>
      </div>

      <button (click)="increment()" [disabled]="isLocked">+1</button>
      <button (click)="toggleDetails()">Toggle Details</button>
      <button (click)="toggleLock()">Toggle Lock</button>
    </div>
  `
})
export class AppComponent implements OnInit {
  title = '';
  count = 0;
  showDetails = true;
  isLocked = false;
  typedText = '';

  constructor(private counterService: CounterService) {
    this.count = this.counterService.getValue();
  }

  ngOnInit() {
    this.title = 'Loaded via OnInit!';
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.typedText = input.value;
  }

  increment() {
    this.count = this.counterService.increment();
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  toggleLock() {
    this.isLocked = !this.isLocked;
  }
}
