import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { resolveValue, setValue } from '../../expression-resolver';

export class NgModelParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attrName = '[(ngmodel)]';
      if (el.hasAttribute(attrName)) {
        const propName = el.getAttribute(attrName)!;
        el.removeAttribute(attrName);
        const inputEl = el as HTMLInputElement;

        // Component -> DOM
        context.bindings.push({
          update: (inst: any) => {
            const val = resolveValue(inst, propName, context.declarations);
            if (inputEl.type === 'checkbox') {
              inputEl.checked = Boolean(val);
            } else {
              inputEl.value = val !== undefined ? String(val) : '';
            }
          }
        });

        // DOM -> Component
        const eventName = (inputEl.type === 'checkbox' || inputEl.tagName === 'SELECT') ? 'change' : 'input';
        inputEl.addEventListener(eventName, (event: Event) => {
          const target = event.target as HTMLInputElement;
          const val = inputEl.type === 'checkbox' ? target.checked : target.value;
          setValue(context.instance, propName, val);
        });
      }
    }
  }
}
