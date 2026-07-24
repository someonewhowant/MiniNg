import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { resolveValue } from '../../expression-resolver';

const PROP_BINDING_RE = /^\[(\w+)\]$/;

export class PropBindingParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        const propMatch = attr.name.match(PROP_BINDING_RE);
        if (propMatch) {
          const propName = propMatch[1];
          const expr = attr.value;
          el.removeAttribute(attr.name);
          context.bindings.push({
            update: (inst: any) => {
              const val = resolveValue(inst, expr, context.declarations);
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
  }
}
