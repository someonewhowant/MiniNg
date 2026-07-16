import 'reflect-metadata';

export const INJECTABLE_KEY = Symbol('injectable');

export function Injectable(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(INJECTABLE_KEY, true, target);
  };
}
