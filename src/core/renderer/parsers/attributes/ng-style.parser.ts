import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { resolveValue, parseObjectLiteral } from '../../expression-resolver';

export class NgStyleParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attrName = '[ngstyle]';
      if (el.hasAttribute(attrName)) {
        const expr = el.getAttribute(attrName)!;
        el.removeAttribute(attrName);
        context.bindings.push({
          update: (inst: any) => {
            let styleObj: any = {};
            if (expr.trim().startsWith('{')) {
              const parsed = parseObjectLiteral(expr);
              for (const [key, valExpr] of Object.entries(parsed)) {
                styleObj[key] = resolveValue(inst, valExpr, context.declarations);
              }
            } else {
              styleObj = resolveValue(inst, expr, context.declarations);
            }
            
            if (styleObj && typeof styleObj === 'object') {
              for (const [styleName, styleValue] of Object.entries(styleObj)) {
                (el as HTMLElement).style[styleName as any] = styleValue as string;
              }
            }
          }
        });
      }
    }
  }
}
