import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { resolveValue } from '../../expression-resolver';
import { container } from '../../../di/container';
import { Router } from '../../../router/router';

export class RouterLinkParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attrName = '[routerlink]';
      if (el.hasAttribute(attrName)) {
        const expr = el.getAttribute(attrName)!;
        el.removeAttribute(attrName);
        const router = container.resolve(Router);
        
        context.bindings.push({
          update: (inst: any) => {
            const path = resolveValue(inst, expr, context.declarations);
            if (el.tagName.toLowerCase() === 'a') {
              el.setAttribute('href', `#${path}`);
            }
          }
        });
        
        el.addEventListener('click', (event: Event) => {
          event.preventDefault();
          const path = resolveValue(context.instance, expr, context.declarations);
          router.navigate(path);
        });
      }
    }
  }
}
