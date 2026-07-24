import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { resolveValue, parseObjectLiteral } from '../../expression-resolver';

export class NgClassParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attrName = '[ngclass]';
      if (el.hasAttribute(attrName)) {
        const expr = el.getAttribute(attrName)!;
        el.removeAttribute(attrName);
        context.bindings.push({
          update: (inst: any) => {
            let classObj: any = {};
            if (expr.trim().startsWith('{')) {
              const parsed = parseObjectLiteral(expr);
              for (const [key, valExpr] of Object.entries(parsed)) {
                classObj[key] = resolveValue(inst, valExpr, context.declarations);
              }
            } else {
              classObj = resolveValue(inst, expr, context.declarations);
            }
            
            if (classObj && typeof classObj === 'object') {
              for (const [className, condition] of Object.entries(classObj)) {
                if (condition) {
                  el.classList.add(className);
                } else {
                  el.classList.remove(className);
                }
              }
            }
          }
        });
      }
    }
  }
}
