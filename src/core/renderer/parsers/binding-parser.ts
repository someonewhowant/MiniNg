

// Moved ViewBinding definition here or to a types file to avoid circular dependencies
// Let's create a shared types file later, but for now we can define it here if needed.
// Actually, it's better to put ViewBinding in this file so parsers can use it.

export interface ViewBinding {
  update(instance: any): void;
  destroy?: () => void;
}

export interface ParserContext {
  instance: any;
  bindings: ViewBinding[];
  declarations: Function[];
  renderChild?: (ComponentClass: Function, hostElement: HTMLElement, initialInputs?: Record<string, any>) => any;
  switchContext?: { expr: string; matched: boolean; pendingDefaultUpdate?: boolean };
}

export interface ParseResult {
  haltProcessing?: boolean; // if true, the Orchestrator stops processing this node and its children
}

export interface BindingParser {
  parse(
    node: Node, 
    context: ParserContext, 
    parseNodeFn: (node: Node, context: ParserContext) => void
  ): ParseResult | void;
}
