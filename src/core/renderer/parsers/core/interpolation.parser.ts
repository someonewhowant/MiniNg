import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { resolveValue } from '../../expression-resolver';

const INTERPOLATION_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

export class InterpolationParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || '';
      if (text.includes('{{')) {
        const originalText = text;
        context.bindings.push({
          update: (inst: any) => {
            let newText = originalText;
            let match;
            INTERPOLATION_RE.lastIndex = 0;
            while ((match = INTERPOLATION_RE.exec(originalText)) !== null) {
              const expr = match[1];
              const value = resolveValue(inst, expr, context.declarations);
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
  }
}
