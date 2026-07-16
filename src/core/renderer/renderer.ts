import { getComponentConfig } from '../decorators/component';
import { TemplateParser, ViewBinding } from './template-parser';
import { createReactiveProxy } from './change-detection';
import { container } from '../di/container';

export interface ComponentRef {
  instance: any;
  hostElement: HTMLElement;
  bindings: ViewBinding[];
}

export class Renderer {
  static render(ComponentClass: new (...args: any[]) => any, hostElement: HTMLElement): ComponentRef {
    const config = getComponentConfig(ComponentClass);
    if (!config) {
      throw new Error(`Class ${ComponentClass.name} is not a valid component.`);
    }

    const rawInstance = container.resolve(ComponentClass);

    let bindings: ViewBinding[] = [];

    const proxyInstance = createReactiveProxy(rawInstance, () => {
      TemplateParser.updateBindings(bindings, proxyInstance);
    });

    const parsed = TemplateParser.parse(config.template, proxyInstance);
    bindings = parsed.bindings;

    hostElement.innerHTML = ''; // Clear host
    hostElement.appendChild(parsed.fragment);

    // Initial check for bindings is done in parse, but we do it again just to be safe
    // Actually no need, parse does it.
    
    // Lifecycle: OnInit
    if ('ngOnInit' in proxyInstance && typeof proxyInstance.ngOnInit === 'function') {
      queueMicrotask(() => {
        proxyInstance.ngOnInit();
      });
    }

    return {
      instance: proxyInstance,
      hostElement,
      bindings
    };
  }
}
