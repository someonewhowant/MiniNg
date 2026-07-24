import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { resolveValue } from '../../expression-resolver';

const EVENT_BINDING_RE = /^\((\w+)\)$/;

export class EventBindingParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        const eventMatch = attr.name.match(EVENT_BINDING_RE);
        if (eventMatch) {
          const eventName = eventMatch[1];
          const methodMatch = attr.value.match(/^(\w+)\((.*?)\)$/);
          if (methodMatch) {
            const methodName = methodMatch[1];
            const argsStr = methodMatch[2].trim();
            el.addEventListener(eventName, (event) => {
              if (argsStr === '$event') {
                context.instance[methodName](event);
              } else if (argsStr) {
                const argVal = resolveValue(context.instance, argsStr, context.declarations);
                context.instance[methodName](argVal);
              } else {
                context.instance[methodName]();
              }
            });
          }
          el.removeAttribute(attr.name);
        }
      });
    }
  }
}
