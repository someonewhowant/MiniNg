export interface ViewBinding {
  update(instance: any): void;
}

const INTERPOLATION_RE = /\{\{\s*(\w+)\s*\}\}/g;
const EVENT_BINDING_RE = /^\((\w+)\)$/;
const PROP_BINDING_RE = /^\[(\w+)\]$/;

export class TemplateParser {
  static parse(template: string, instance: any): { fragment: DocumentFragment; bindings: ViewBinding[] } {
    const templateElement = document.createElement('template');
    templateElement.innerHTML = template.trim();
    const fragment = templateElement.content;
    const bindings: ViewBinding[] = [];

    TemplateParser.parseNode(fragment, instance, bindings);
    
    // Initial evaluation for static bindings
    TemplateParser.updateBindings(bindings, instance);
    
    return { fragment, bindings };
  }

  static parseNode(node: Node, instance: any, bindings: ViewBinding[]) {
    // 1. *ngIf
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
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
            const condition = Boolean(inst[ngIfExpr]);
            if (condition && !attachedElement) {
              attachedElement = templateClone.cloneNode(true) as Element;
              anchor.parentNode?.insertBefore(attachedElement, anchor.nextSibling);
              childBindings = [];
              TemplateParser.parseNode(attachedElement, inst, childBindings);
              childBindings.forEach(b => b.update(inst));
            } else if (!condition && attachedElement) {
              attachedElement.remove();
              attachedElement = null;
              childBindings = [];
            } else if (condition && attachedElement) {
              childBindings.forEach(b => b.update(inst));
            }
          }
        });
        return; // Skip parsing children, they will be parsed when attached
      }
    }

    // 2. Attributes: Events & Props
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        // Events
        const eventMatch = attr.name.match(EVENT_BINDING_RE);
        if (eventMatch) {
          const eventName = eventMatch[1];
          // We changed the regex conceptually, let's use a non-global regex inline
          // to match methodName(args)
          const methodMatch = attr.value.match(/^(\w+)\((.*?)\)$/);
          if (methodMatch) {
            const methodName = methodMatch[1];
            const argsStr = methodMatch[2].trim();
            el.addEventListener(eventName, (event) => {
              if (argsStr === '$event') {
                instance[methodName](event);
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
              const val = inst[expr];
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
              const value = inst[expr];
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
    children.forEach(child => TemplateParser.parseNode(child, instance, bindings));
  }

  static updateBindings(bindings: ViewBinding[], instance: any): void {
    bindings.forEach(b => b.update(instance));
  }
}
