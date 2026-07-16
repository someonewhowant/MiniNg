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

  constructor(private counterService: CounterService) {
    this.count = this.counterService.getValue();
  }

  ngOnInit() {
    this.title = 'Loaded via OnInit!';
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
