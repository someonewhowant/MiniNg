import { BindingParser, ParserContext, ParseResult, ViewBinding } from '../binding-parser';
import { resolveValue } from '../../expression-resolver';

export class NgSwitchParser implements BindingParser {
  parse(node: Node, context: ParserContext, parseNodeFn: (node: Node, ctx: ParserContext) => void): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      
      // Handle [ngSwitch] setup
      if (el.hasAttribute('[ngSwitch]')) {
         const expr = el.getAttribute('[ngSwitch]')!;
         el.removeAttribute('[ngSwitch]');
         context.switchContext = { expr, matched: false };
         context.bindings.push({
            update: () => { if (context.switchContext) context.switchContext.matched = false; }
         });
         // Don't halt, let children be processed
      }

      // Handle *ngSwitchCase
      const ngSwitchCaseExpr = el.getAttribute('*ngSwitchCase');
      if (ngSwitchCaseExpr !== null) {
        el.removeAttribute('*ngSwitchCase');
        const anchor = document.createComment(` ngSwitchCase: ${ngSwitchCaseExpr} `);
        el.parentNode?.insertBefore(anchor, el);
        el.remove();

        const templateClone = el.cloneNode(true) as Element;
        let attachedElement: Element | null = null;
        let childBindings: ViewBinding[] = [];

        const switchCtx = context.switchContext;

        context.bindings.push({
          update: (inst: any) => {
            if (!switchCtx) throw new Error('*ngSwitchCase must be inside [ngSwitch]');
            const switchVal = resolveValue(inst, switchCtx.expr, context.declarations);
            const caseVal = resolveValue(inst, ngSwitchCaseExpr, context.declarations);
            const condition = switchVal === caseVal;
            
            if (condition) {
              switchCtx.matched = true;
            }

            if (condition && !attachedElement) {
              attachedElement = templateClone.cloneNode(true) as Element;
              anchor.parentNode?.insertBefore(attachedElement, anchor.nextSibling);
              childBindings = [];
              parseNodeFn(attachedElement, { ...context, instance: inst, bindings: childBindings, switchContext: switchCtx });
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

      // Handle *ngSwitchDefault
      const hasSwitchDefault = el.hasAttribute('*ngSwitchDefault');
      if (hasSwitchDefault) {
        el.removeAttribute('*ngSwitchDefault');
        const anchor = document.createComment(` ngSwitchDefault `);
        el.parentNode?.insertBefore(anchor, el);
        el.remove();

        const templateClone = el.cloneNode(true) as Element;
        let attachedElement: Element | null = null;
        let childBindings: ViewBinding[] = [];
        
        const switchCtx = context.switchContext;

        context.bindings.push({
          update: (inst: any) => {
            if (!switchCtx) throw new Error('*ngSwitchDefault must be inside [ngSwitch]');
            if (switchCtx.pendingDefaultUpdate) return;
            switchCtx.pendingDefaultUpdate = true;
            
            queueMicrotask(() => {
              switchCtx.pendingDefaultUpdate = false;
              const condition = !switchCtx.matched;
              
              if (condition && !attachedElement) {
                attachedElement = templateClone.cloneNode(true) as Element;
                anchor.parentNode?.insertBefore(attachedElement, anchor.nextSibling);
                childBindings = [];
                parseNodeFn(attachedElement, { ...context, instance: inst, bindings: childBindings, switchContext: switchCtx });
                childBindings.forEach(b => b.update(inst));
              } else if (!condition && attachedElement) {
                childBindings.forEach(b => { if (b.destroy) b.destroy(); });
                attachedElement.remove();
                attachedElement = null;
                childBindings = [];
              } else if (condition && attachedElement) {
                childBindings.forEach(b => b.update(inst));
              }
            });
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
