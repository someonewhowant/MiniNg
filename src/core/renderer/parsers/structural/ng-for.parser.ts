import { BindingParser, ParserContext, ParseResult, ViewBinding } from '../binding-parser';
import { resolveValue } from '../../expression-resolver';

export class NgForParser implements BindingParser {
  parse(node: Node, context: ParserContext, parseNodeFn: (node: Node, ctx: ParserContext) => void): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const ngForExpr = el.getAttribute('*ngFor');
      if (ngForExpr) {
        el.removeAttribute('*ngFor');
        const match = ngForExpr.match(/let\s+(\w+)\s+of\s+([\w.]+)/);
        if (!match) throw new Error(`Invalid *ngFor syntax: ${ngForExpr}`);
        const itemVar = match[1];
        const arrayProp = match[2];

        const anchor = document.createComment(` ngFor: ${ngForExpr} `);
        el.parentNode?.insertBefore(anchor, el);
        el.remove();

        const templateClone = el.cloneNode(true) as Element;
        let renderedNodes: Element[] = [];
        let childBindingsList: ViewBinding[][] = [];

        context.bindings.push({
          update: (inst: any) => {
            const array = resolveValue(inst, arrayProp, context.declarations);
            if (!Array.isArray(array)) return;

            // Clear old nodes
            childBindingsList.forEach(list => list.forEach(b => { if (b.destroy) b.destroy(); }));
            renderedNodes.forEach(n => n.remove());
            renderedNodes = [];
            childBindingsList = [];

            // Render new nodes
            array.forEach((item, index) => {
              const clone = templateClone.cloneNode(true) as Element;
              
              const localContext = new Proxy(inst, {
                get(target, prop) {
                  if (prop === itemVar) return item;
                  if (prop === 'index') return index;
                  const val = target[prop as keyof typeof target];
                  return typeof val === 'function' ? val.bind(target) : val;
                }
              });

              const lastNode = renderedNodes.length > 0 ? renderedNodes[renderedNodes.length - 1] : anchor;
              lastNode.parentNode?.insertBefore(clone, lastNode.nextSibling);

              renderedNodes.push(clone);

              const childBindings: ViewBinding[] = [];
              parseNodeFn(clone, { ...context, instance: localContext, bindings: childBindings });
              childBindings.forEach(b => b.update(localContext));
              childBindingsList.push(childBindings);
            });
          },
          destroy: () => {
             childBindingsList.forEach(list => list.forEach(b => { if (b.destroy) b.destroy(); }));
          }
        });
        return { haltProcessing: true };
      }
    }
  }
}
