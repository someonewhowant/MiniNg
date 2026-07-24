import { BindingParser, ParserContext, ParseResult, ViewBinding } from '../binding-parser';
import { resolveValue } from '../../expression-resolver';

export class NgIfParser implements BindingParser {
  parse(node: Node, context: ParserContext, parseNodeFn: (node: Node, ctx: ParserContext) => void): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const ngIfExpr = el.getAttribute('*ngIf');
      if (ngIfExpr) {
        el.removeAttribute('*ngIf');
        const anchor = document.createComment(` ngIf: ${ngIfExpr} `);
        el.parentNode?.insertBefore(anchor, el);
        el.remove();

        const templateClone = el.cloneNode(true) as Element;
        let attachedElement: Element | null = null;
        let childBindings: ViewBinding[] = [];

        context.bindings.push({
          update: (inst: any) => {
            const condition = Boolean(resolveValue(inst, ngIfExpr, context.declarations));
            if (condition && !attachedElement) {
              attachedElement = templateClone.cloneNode(true) as Element;
              anchor.parentNode?.insertBefore(attachedElement, anchor.nextSibling);
              childBindings = [];
              parseNodeFn(attachedElement, { ...context, instance: inst, bindings: childBindings });
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
        return { haltProcessing: true };
      }
    }
  }
}
