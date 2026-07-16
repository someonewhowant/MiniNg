import { Component } from '@core';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <button (click)="greet()">Say Hello</button>
    </div>
  `
})
export class AppComponent {
  title = 'MiniNG Framework';
  description = 'My own Angular MVP!';

  greet() {
    alert('Hello from MiniNG!');
    console.log('Button clicked!');
  }
}
