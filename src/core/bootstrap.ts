import { Renderer } from './renderer/renderer';
import { getComponentConfig } from './decorators/component';

export function bootstrap(ComponentClass: new (...args: any[]) => any): void {
  const config = getComponentConfig(ComponentClass);
  if (!config) {
    throw new Error(`Cannot bootstrap. ${ComponentClass.name} is not a valid component.`);
  }

  const hostElement = document.querySelector(config.selector) as HTMLElement;
  if (!hostElement) {
    throw new Error(`Cannot bootstrap. Host element '${config.selector}' not found in the DOM.`);
  }

  Renderer.render(ComponentClass, hostElement);
}
