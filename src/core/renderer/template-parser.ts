export interface InterpolationBinding {
  node: Node;
  expression: string;
  originalText: string;
}

const INTERPOLATION_RE = /\{\{\s*(\w+)\s*\}\}/g;
const EVENT_BINDING_RE = /^\((\w+)\)$/;
const METHOD_CALL_RE = /^(\w+)\(\)$/;

export class TemplateParser {
  static parse(template: string, instance: any): { fragment: DocumentFragment; bindings: InterpolationBinding[] } {
    const templateElement = document.createElement('template');
    templateElement.innerHTML = template.trim();
    const fragment = templateElement.content;

    const bindings: InterpolationBinding[] = [];

    // 1. Parse text nodes for interpolation
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.includes('{{')) {
        const text = node.nodeValue;
        INTERPOLATION_RE.lastIndex = 0; // Reset regex
        let match;
        let hasMatch = false;

        while ((match = INTERPOLATION_RE.exec(text)) !== null) {
          hasMatch = true;
          bindings.push({
            node: node,
            expression: match[1],
            originalText: text
          });
        }

        if (hasMatch) {
          // Simple replacement for initial render (MVP)
          let newText = text;
          bindings.filter(b => b.node === node).forEach(b => {
            // Replace all occurrences of this expression in the text
            const regex = new RegExp(`\\{\\{\\s*${b.expression}\\s*\\}\\}`, 'g');
            const value = instance[b.expression];
            newText = newText.replace(regex, value !== undefined ? String(value) : '');
          });
          node.nodeValue = newText;
        }
      }
    }

    // 2. Parse elements for event bindings
    const elements = fragment.querySelectorAll('*');
    elements.forEach(element => {
      const attributes = Array.from(element.attributes);
      attributes.forEach(attr => {
        const eventMatch = attr.name.match(EVENT_BINDING_RE);
        if (eventMatch) {
          const eventName = eventMatch[1];
          const methodMatch = attr.value.match(METHOD_CALL_RE);
          if (methodMatch) {
            const methodName = methodMatch[1];
            if (typeof instance[methodName] === 'function') {
              element.addEventListener(eventName, instance[methodName].bind(instance));
            } else {
              console.warn(`Method ${methodName} not found on component instance.`);
            }
          }
          element.removeAttribute(attr.name); // Clean up synthetic attribute
        }
      });
    });

    return { fragment, bindings };
  }
}
