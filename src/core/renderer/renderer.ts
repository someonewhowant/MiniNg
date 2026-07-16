import { getComponentConfig } from '../decorators/component';
import { TemplateParser, InterpolationBinding } from './template-parser';

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

    const instance = new ComponentClass(); // Direct instantiation for Phase 1

    const { fragment, bindings } = TemplateParser.parse(config.template, instance);

    hostElement.innerHTML = ''; // Clear host
    hostElement.appendChild(fragment);

    return {
      instance,
      hostElement,
      bindings
    };
  }
}
