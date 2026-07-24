import { ViewBinding, ParserContext, BindingParser } from './parsers/binding-parser';
import { NgIfParser } from './parsers/structural/ng-if.parser';
import { NgForParser } from './parsers/structural/ng-for.parser';
import { NgSwitchParser } from './parsers/structural/ng-switch.parser';
import { NgClassParser } from './parsers/attributes/ng-class.parser';
import { NgStyleParser } from './parsers/attributes/ng-style.parser';
import { NgModelParser } from './parsers/attributes/ng-model.parser';
import { RouterLinkParser } from './parsers/attributes/router-link.parser';
import { ChildComponentParser } from './parsers/core/child-component.parser';
import { EventBindingParser } from './parsers/core/event-binding.parser';
import { PropBindingParser } from './parsers/core/prop-binding.parser';
import { InterpolationParser } from './parsers/core/interpolation.parser';
import { RouterOutletParser } from './parsers/core/router-outlet.parser';

export type { ViewBinding };

export class TemplateParser {
  // Register parsers in order of precedence
  private static parsers: BindingParser[] = [
    new NgIfParser(),
    new NgSwitchParser(),
    new NgForParser(),
    new RouterOutletParser(),
    new ChildComponentParser(),
    new RouterLinkParser(),
    new NgClassParser(),
    new NgStyleParser(),
    new NgModelParser(),
    new EventBindingParser(),
    new PropBindingParser(),
    new InterpolationParser()
  ];

  static parse(
    template: string, 
    instance: any,
    declarations: Function[] = [],
    renderChild?: (ComponentClass: Function, hostElement: HTMLElement, initialInputs?: Record<string, any>) => any
  ): { fragment: DocumentFragment; bindings: ViewBinding[] } {
    const templateElement = document.createElement('template');
    templateElement.innerHTML = template.trim();
    const fragment = templateElement.content;
    const bindings: ViewBinding[] = [];

    const context: ParserContext = {
      instance,
      bindings,
      declarations,
      renderChild
    };

    TemplateParser.parseNode(fragment, context);
    
    // Initial evaluation for static bindings
    TemplateParser.updateBindings(bindings, instance);
    
    return { fragment, bindings };
  }

  static parseNode(node: Node, context: ParserContext) {
    // We iterate through parsers
    for (const parser of TemplateParser.parsers) {
      const result = parser.parse(node, context, TemplateParser.parseNode);
      if (result && result.haltProcessing) {
        return; // Halt processing this node and its children
      }
    }

    // Recursively parse children
    const children = Array.from(node.childNodes);
    children.forEach(child => TemplateParser.parseNode(child, context));
  }

  static updateBindings(bindings: ViewBinding[], instance: any): void {
    bindings.forEach(b => b.update(instance));
  }
}
