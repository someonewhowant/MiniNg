import { getComponentConfig } from '../decorators/component';

export interface ViewBinding {
  update(instance: any): void;
  destroy?: () => void;
}

const INTERPOLATION_RE = /\{\{\s*([\w.]+)\s*\}\}/g;
const EVENT_BINDING_RE = /^\((\w+)\)$/;
const PROP_BINDING_RE = /^\[(\w+)\]$/;

function resolveValue(context: any, expr: string): any {
  return expr.split('.').reduce((acc, part) => acc && acc[part], context);
}

function setValue(context: any, expr: string, value: any): void {
  const parts = expr.split('.');
  const last = parts.pop()!;
  const target = parts.reduce((acc, part) => acc && acc[part], context);
  if (target) {
    target[last] = value;
  }
}

export class TemplateParser {
  static parse(
    template: string, 
    instance: any,
    declarations: Function[] = [],
    renderChild?: (ComponentClass: Function, hostElement: HTMLElement) => any
  ): { fragment: DocumentFragment; bindings: ViewBinding[] } {
    const templateElement = document.createElement('template');
    templateElement.innerHTML = template.trim();
    const fragment = templateElement.content;
    const bindings: ViewBinding[] = [];

    TemplateParser.parseNode(fragment, instance, bindings, declarations, renderChild);
    
    // Initial evaluation for static bindings
    TemplateParser.updateBindings(bindings, instance);
    
    return { fragment, bindings };
  }

  static parseNode(
    node: Node, 
    instance: any, 
    bindings: ViewBinding[],
    declarations: Function[] = [],
    renderChild?: (ComponentClass: Function, hostElement: HTMLElement) => any
  ) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      
      // 1. *ngIf
      const ngIfExpr = el.getAttribute('*ngIf');
      if (ngIfExpr) {
        el.removeAttribute('*ngIf');
        const anchor = document.createComment(` ngIf: ${ngIfExpr} `);
        el.parentNode?.insertBefore(anchor, el);
        el.remove(); // Remove from DOM initially

        const templateClone = el.cloneNode(true) as Element;
        let attachedElement: Element | null = null;
        let childBindings: ViewBinding[] = [];

        bindings.push({
          update: (inst: any) => {
            const condition = Boolean(resolveValue(inst, ngIfExpr));
            if (condition && !attachedElement) {
              attachedElement = templateClone.cloneNode(true) as Element;
              anchor.parentNode?.insertBefore(attachedElement, anchor.nextSibling);
              childBindings = [];
              TemplateParser.parseNode(attachedElement, inst, childBindings, declarations, renderChild);
              childBindings.forEach(b => b.update(inst));
            } else if (!condition && attachedElement) {
              childBindings.forEach(b => { if (b.destroy) b.destroy(); });
              attachedElement.remove();
              attachedElement = null;
              childBindings = [];
            } else if (condition && attachedElement) {
              childBindings.forEach(b => b.update(inst));
            }
          },
          destroy: () => {
             childBindings.forEach(b => { if (b.destroy) b.destroy(); });
          }
        });
        return; // Skip parsing children, they will be parsed when attached
      }

      // 1.5 *ngFor
      const ngForExpr = el.getAttribute('*ngFor');
      if (ngForExpr) {
        el.removeAttribute('*ngFor');
        const match = ngForExpr.match(/let\s+(\w+)\s+of\s+([\w.]+)/);
        if (!match) throw new Error(`Invalid *ngFor syntax: ${ngForExpr}`);
        const itemVar = match[1];
        const arrayProp = match[2];

        const anchor = document.createComment(` ngFor: ${ngForExpr} `);
        el.parentNode?.insertBefore(anchor, el);
        el.remove();

        const templateClone = el.cloneNode(true) as Element;
        let renderedNodes: Element[] = [];
        let childBindingsList: ViewBinding[][] = [];

        bindings.push({
          update: (inst: any) => {
            const array = resolveValue(inst, arrayProp);
            if (!Array.isArray(array)) return;

            // Clear old nodes
            childBindingsList.forEach(list => list.forEach(b => { if (b.destroy) b.destroy(); }));
            renderedNodes.forEach(n => n.remove());
            renderedNodes = [];
            childBindingsList = [];

            // Render new nodes
            array.forEach((item, index) => {
              const clone = templateClone.cloneNode(true) as Element;
              
              const localContext = new Proxy(inst, {
                get(target, prop) {
                  if (prop === itemVar) return item;
                  if (prop === 'index') return index;
                  const val = target[prop as keyof typeof target];
                  return typeof val === 'function' ? val.bind(target) : val;
                }
              });

              const lastNode = renderedNodes.length > 0 ? renderedNodes[renderedNodes.length - 1] : anchor;
              lastNode.parentNode?.insertBefore(clone, lastNode.nextSibling);

              renderedNodes.push(clone);

              const childBindings: ViewBinding[] = [];
              TemplateParser.parseNode(clone, localContext, childBindings, declarations, renderChild);
              childBindings.forEach(b => b.update(localContext));
              childBindingsList.push(childBindings);
            });
          },
          destroy: () => {
             childBindingsList.forEach(list => list.forEach(b => { if (b.destroy) b.destroy(); }));
          }
        });
        return; // Children parsed during render
      }

      // 1.8 Child Components
      const tagName = el.tagName.toLowerCase();
      let ChildComponentClass: Function | undefined;
      
      if (declarations.length > 0) {
        ChildComponentClass = declarations.find(c => getComponentConfig(c)?.selector === tagName);
      }

      if (ChildComponentClass && renderChild) {
        const attributes = Array.from(el.attributes);
        const inputBindings: { propName: string; expr: string }[] = [];
        const outputBindings: { eventName: string; methodName: string; argsStr: string }[] = [];

        attributes.forEach(attr => {
           const propMatch = attr.name.match(/^\[(\w+)\]$/);
           if (propMatch) {
              inputBindings.push({ propName: propMatch[1], expr: attr.value });
              el.removeAttribute(attr.name);
           }
           
           const eventMatch = attr.name.match(/^\((\w+)\)$/);
           if (eventMatch) {
              const methodMatch = attr.value.match(/^(\w+)\((.*?)\)$/);
              if (methodMatch) {
                 outputBindings.push({ 
                    eventName: eventMatch[1], 
                    methodName: methodMatch[1], 
                    argsStr: methodMatch[2].trim() 
                 });
              }
              el.removeAttribute(attr.name);
           }
        });

        const childRef = renderChild(ChildComponentClass, el as HTMLElement);
        const childInstance = childRef.instance;

        let firstChange = true;
        let previousInputs: Record<string, any> = {};

        // Apply input bindings and handle OnChanges
        bindings.push({
           update: (inst: any) => {
              let hasChanges = false;
              const changes: any = {};

              inputBindings.forEach(({ propName, expr }) => {
                 const currentVal = resolveValue(inst, expr);
                 const prevVal = previousInputs[propName];

                 if (currentVal !== prevVal || firstChange) {
                    hasChanges = true;
                    changes[propName] = {
                       previousValue: firstChange ? undefined : prevVal,
                       currentValue: currentVal,
                       firstChange
                    };
                    childInstance[propName] = currentVal;
                    previousInputs[propName] = currentVal;
                 }
              });

              if (hasChanges && typeof childInstance.ngOnChanges === 'function') {
                 childInstance.ngOnChanges(changes);
              }
              firstChange = false;
           },
           destroy: () => {
              if (typeof childRef.destroy === 'function') {
                 childRef.destroy();
              }
           }
        });

        // Apply output bindings
        outputBindings.forEach(({ eventName, methodName, argsStr }) => {
           const emitter = childInstance[eventName];
           if (emitter && typeof emitter.subscribe === 'function') {
              emitter.subscribe((eventArg: any) => {
                 if (argsStr === '$event') {
                    instance[methodName](eventArg);
                 } else if (argsStr) {
                    const argVal = resolveValue(instance, argsStr);
                    instance[methodName](argVal);
                 } else {
                    instance[methodName]();
                 }
              });
           }
        });

        return; // Skip standard element processing and child nodes
      }
    }

    // 2. Attributes: Events & Props & ngModel
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        // [(ngModel)]
        if (attr.name === '[(ngModel)]') {
          const propName = attr.value;
          el.removeAttribute(attr.name);
          const inputEl = el as HTMLInputElement;

          // Component -> DOM
          bindings.push({
            update: (inst: any) => {
              const val = resolveValue(inst, propName);
              if (inputEl.type === 'checkbox') {
                inputEl.checked = Boolean(val);
              } else {
                inputEl.value = val !== undefined ? String(val) : '';
              }
            }
          });

          // DOM -> Component
          const eventName = (inputEl.type === 'checkbox' || inputEl.tagName === 'SELECT') ? 'change' : 'input';
          inputEl.addEventListener(eventName, (event: Event) => {
            const target = event.target as HTMLInputElement;
            const val = inputEl.type === 'checkbox' ? target.checked : target.value;
            setValue(instance, propName, val);
          });
          return;
        }

        // Events
        const eventMatch = attr.name.match(EVENT_BINDING_RE);
        if (eventMatch) {
          const eventName = eventMatch[1];
          const methodMatch = attr.value.match(/^(\w+)\((.*?)\)$/);
          if (methodMatch) {
            const methodName = methodMatch[1];
            const argsStr = methodMatch[2].trim();
            el.addEventListener(eventName, (event) => {
              if (argsStr === '$event') {
                instance[methodName](event);
              } else if (argsStr) {
                const argVal = resolveValue(instance, argsStr);
                instance[methodName](argVal);
              } else {
                instance[methodName]();
              }
            });
          }
          el.removeAttribute(attr.name);
        }

        // Props
        const propMatch = attr.name.match(PROP_BINDING_RE);
        if (propMatch) {
          const propName = propMatch[1];
          const expr = attr.value;
          el.removeAttribute(attr.name);
          bindings.push({
            update: (inst: any) => {
              const val = resolveValue(inst, expr);
              if (typeof val === 'boolean') {
                if (val) el.setAttribute(propName, '');
                else el.removeAttribute(propName);
              } else {
                (el as any)[propName] = val;
                el.setAttribute(propName, String(val));
              }
            }
          });
        }
      });
    }

    // 3. Text Interpolation
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || '';
      if (text.includes('{{')) {
        const originalText = text;
        bindings.push({
          update: (inst: any) => {
            let newText = originalText;
            let match;
            INTERPOLATION_RE.lastIndex = 0;
            while ((match = INTERPOLATION_RE.exec(originalText)) !== null) {
              const expr = match[1];
              const value = resolveValue(inst, expr);
              newText = newText.replace(`{{ ${expr} }}`, value !== undefined ? String(value) : '');
              newText = newText.replace(`{{${expr}}}`, value !== undefined ? String(value) : '');
            }
            if (node.nodeValue !== newText) {
              node.nodeValue = newText;
            }
          }
        });
      }
    }

    // Recursively parse children
    const children = Array.from(node.childNodes);
    children.forEach(child => TemplateParser.parseNode(child, instance, bindings, declarations, renderChild));
  }

  static updateBindings(bindings: ViewBinding[], instance: any): void {
    bindings.forEach(b => b.update(instance));
  }
}
