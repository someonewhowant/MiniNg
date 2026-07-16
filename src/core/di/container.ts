import 'reflect-metadata';

export class DIContainer {
  private registry = new Map<Function, any>();

  resolve<T>(target: new (...args: any[]) => T): T {
    if (this.registry.has(target)) {
      return this.registry.get(target);
    }

    const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', target) || [];

    const dependencies = paramTypes.map(param => {
      if (!param || param === Object || param === String || param === Number) {
        throw new Error(`Cannot resolve dependency ${param ? param.name : param} in ${target.name}. Make sure it is a valid class.`);
      }
      return this.resolve(param);
    });

    const instance = new target(...dependencies);

    this.registry.set(target, instance);

    return instance;
  }
}

export const container = new DIContainer();
