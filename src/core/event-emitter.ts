export class EventEmitter<T = any> {
  private listeners: ((value: T) => void)[] = [];

  emit(value?: T): void {
    this.listeners.forEach(fn => fn(value as T));
  }

  subscribe(fn: (value: T) => void): void {
    this.listeners.push(fn);
  }
}
