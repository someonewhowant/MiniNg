import { BindingParser, ParserContext, ParseResult } from '../binding-parser';
import { getComponentConfig } from '../../../decorators/component';
import { resolveValue } from '../../expression-resolver';

export class ChildComponentParser implements BindingParser {
  parse(node: Node, context: ParserContext): ParseResult | void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      let ChildComponentClass: Function | undefined;
      
      if (context.declarations.length > 0) {
        ChildComponentClass = context.declarations.find(c => getComponentConfig(c)?.selector === tagName);
      }

      if (ChildComponentClass && context.renderChild) {
        const attributes = Array.from(el.attributes);
        const inputBindings: { propName: string; expr: string }[] = [];
        const outputBindings: { eventName: string; methodName: string; argsStr: string }[] = [];

        const registeredInputs: string[] = Reflect.getMetadata('input:props', ChildComponentClass) || [];
        const registeredOutputs: string[] = Reflect.getMetadata('output:events', ChildComponentClass) || [];

        attributes.forEach(attr => {
           const propMatch = attr.name.match(/^\[(\w+)\]$/);
           if (propMatch) {
              const matchedProp = registeredInputs.find(i => i.toLowerCase() === propMatch[1]) || propMatch[1];
              inputBindings.push({ propName: matchedProp, expr: attr.value });
              el.removeAttribute(attr.name);
           }
           
           const eventMatch = attr.name.match(/^\((\w+)\)$/);
           if (eventMatch) {
              const matchedEvent = registeredOutputs.find(o => o.toLowerCase() === eventMatch[1]) || eventMatch[1];
              const methodMatch = attr.value.match(/^(\w+)\((.*?)\)$/);
              if (methodMatch) {
                 outputBindings.push({ 
                    eventName: matchedEvent, 
                    methodName: methodMatch[1], 
                    argsStr: methodMatch[2].trim() 
                 });
              }
              el.removeAttribute(attr.name);
           }
        });

        const initialInputs: Record<string, any> = {};
        inputBindings.forEach(({ propName, expr }) => {
           initialInputs[propName] = resolveValue(context.instance, expr, context.declarations);
        });

        const childRef = context.renderChild(ChildComponentClass, el as HTMLElement, initialInputs);
        const childInstance = childRef.instance;

        let firstChange = true;
        let previousInputs: Record<string, any> = {};

        context.bindings.push({
           update: (inst: any) => {
              let hasChanges = false;
              const changes: any = {};

              inputBindings.forEach(({ propName, expr }) => {
                 const currentVal = resolveValue(inst, expr, context.declarations);
                 const prevVal = previousInputs[propName];

                 if (currentVal !== prevVal || firstChange) {
                    hasChanges = true;
                    changes[propName] = {
                       previousValue: firstChange ? undefined : prevVal,
                       currentValue: currentVal,
                       firstChange
                    };
                    childInstance[propName] = currentVal;
                    previousInputs[propName] = currentVal;
                 }
              });

              if (hasChanges && typeof childInstance.ngOnChanges === 'function') {
                 childInstance.ngOnChanges(changes);
              }
              firstChange = false;
           },
           destroy: () => {
              if (typeof childRef.destroy === 'function') {
                 childRef.destroy();
              }
           }
        });

        outputBindings.forEach(({ eventName, methodName, argsStr }) => {
           const emitter = childInstance[eventName];
           if (emitter && typeof emitter.subscribe === 'function') {
              emitter.subscribe((eventArg: any) => {
                 if (argsStr === '$event') {
                    context.instance[methodName](eventArg);
                 } else if (argsStr) {
                    const argVal = resolveValue(context.instance, argsStr, context.declarations);
                    context.instance[methodName](argVal);
                 } else {
                    context.instance[methodName]();
                 }
              });
           }
        });

        return { haltProcessing: true };
      }
    }
  }
}
