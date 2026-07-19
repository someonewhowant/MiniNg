import { getComponentConfig } from '../decorators/component';
import { TemplateParser, ViewBinding } from './template-parser';
import { createReactiveProxy } from './change-detection';
import { container } from '../di/container';

export interface ComponentRef {
  instance: any;
  hostElement: HTMLElement;
  bindings: ViewBinding[];
  destroy: () => void;
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

    const parsed = TemplateParser.parse(
      config.template, 
      proxyInstance,
      config.declarations || [],
      (ChildClass, hostEl) => Renderer.render(ChildClass as any, hostEl as HTMLElement)
    );
    bindings = parsed.bindings;

    hostElement.innerHTML = ''; // Clear host
    hostElement.appendChild(parsed.fragment);

    // Lifecycle: OnInit & AfterViewInit
    queueMicrotask(() => {
      if ('ngOnInit' in proxyInstance && typeof proxyInstance.ngOnInit === 'function') {
        proxyInstance.ngOnInit();
      }
      if ('ngAfterViewInit' in proxyInstance && typeof proxyInstance.ngAfterViewInit === 'function') {
        proxyInstance.ngAfterViewInit();
      }
    });

    return {
      instance: proxyInstance,
      hostElement,
      bindings,
      destroy: () => {
        bindings.forEach(b => {
          if (b.destroy) b.destroy();
        });
        if ('ngOnDestroy' in proxyInstance && typeof proxyInstance.ngOnDestroy === 'function') {
          proxyInstance.ngOnDestroy();
        }
      }
    };
  }
}
