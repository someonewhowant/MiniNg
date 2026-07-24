import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { container } from '../../../di/container';
import { Router } from '../../../router/router';

export class RouterOutletParser implements BindingParser {
  parse(node: Node, _context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (el.tagName.toLowerCase() === 'router-outlet') {
        const router = container.resolve(Router);
        router.setOutlet(el as HTMLElement);
      }
    }
  }
}
