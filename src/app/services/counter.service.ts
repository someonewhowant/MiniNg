import { Injectable } from '@core';

@Injectable()
export class CounterService {
  private value = 0;

  increment(): number {
    this.value++;
    return this.value;
  }

  getValue(): number {
    return this.value;
  }
}
