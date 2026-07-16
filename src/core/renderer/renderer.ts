import { getComponentConfig } from '../decorators/component';
import { TemplateParser, InterpolationBinding } from './template-parser';
import { createReactiveProxy } from './change-detection';
import { container } from '../di/container';

export interface ComponentRef {
  instance: any;
  hostElement: HTMLElement;
  bindings: InterpolationBinding[];
}

export class Renderer {
  static render(ComponentClass: new (...args: any[]) => any, hostElement: HTMLElement): ComponentRef {
    const config = getComponentConfig(ComponentClass);
    if (!config) {
      throw new Error(`Class ${ComponentClass.name} is not a valid component.`);
    }

    const rawInstance = container.resolve(ComponentClass);

    let bindings: InterpolationBinding[] = [];

    const proxyInstance = createReactiveProxy(rawInstance, () => {
      TemplateParser.updateBindings(bindings, proxyInstance);
    });

    const parsed = TemplateParser.parse(config.template, proxyInstance);
    bindings = parsed.bindings;

    hostElement.innerHTML = ''; // Clear host
    hostElement.appendChild(parsed.fragment);

    return {
      instance: proxyInstance,
      hostElement,
      bindings
    };
  }
}
