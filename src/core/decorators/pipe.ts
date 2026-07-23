import 'reflect-metadata';

export interface PipeConfig {
  name: string;
}

export function Pipe(config: PipeConfig) {
  return function (target: Function) {
    Reflect.defineMetadata('pipe', config, target);
  };
}

export function getPipeConfig(target: Function): PipeConfig | undefined {
  return Reflect.getMetadata('pipe', target);
}

export interface PipeTransform {
  transform(value: any, ...args: any[]): any;
}
