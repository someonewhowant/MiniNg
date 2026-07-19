import 'reflect-metadata';

export const INPUT_META_KEY = Symbol('input:props');
export const OUTPUT_META_KEY = Symbol('output:events');

export function Input(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const inputs = Reflect.getMetadata(INPUT_META_KEY, target.constructor) || [];
    inputs.push(propertyKey);
    Reflect.defineMetadata(INPUT_META_KEY, inputs, target.constructor);
  };
}

export function Output(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const outputs = Reflect.getMetadata(OUTPUT_META_KEY, target.constructor) || [];
    outputs.push(propertyKey);
    Reflect.defineMetadata(OUTPUT_META_KEY, outputs, target.constructor);
  };
}
