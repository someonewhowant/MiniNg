import 'reflect-metadata';

export interface ComponentConfig {
  selector: string;
  template: string;
  declarations?: Function[];
}

export const COMPONENT_CONFIG_KEY = Symbol('component:config');

export function Component(config: ComponentConfig): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(COMPONENT_CONFIG_KEY, config, target);
  };
}

export function getComponentConfig(target: any): ComponentConfig | undefined {
  return Reflect.getMetadata(COMPONENT_CONFIG_KEY, target);
}
