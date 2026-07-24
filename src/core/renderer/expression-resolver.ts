import { getPipeConfig } from '../decorators/pipe';
import { container } from '../di/container';

export function resolveValue(context: any, expr: string, declarations: Function[] = []): any {
  let cleanExpr = expr.trim();

  // Handle Pipes
  if (cleanExpr.includes('|')) {
    const parts = cleanExpr.split('|');
    let value = resolveValue(context, parts[0].trim(), declarations);
    
    for (let i = 1; i < parts.length; i++) {
      const pipeExpr = parts[i].trim();
      const [pipeName, ...argsStr] = pipeExpr.split(':');
      
      const PipeClass = declarations.find(d => {
         const config = getPipeConfig(d);
         return config && config.name === pipeName;
      });

      if (PipeClass) {
        const pipeInstance = container.resolve(PipeClass as any) as any;
        const args = argsStr.map(a => resolveValue(context, a.trim(), declarations));
        value = pipeInstance.transform(value, ...args);
      } else {
        console.warn(`Pipe '${pipeName}' not found in declarations.`);
      }
    }
    return value;
  }

  let isNegated = false;
  if (cleanExpr.startsWith('!')) {
    isNegated = true;
    cleanExpr = cleanExpr.substring(1).trim();
  }

  // Handle method calls with no args
  const methodMatch = cleanExpr.match(/^(\w+)\(\)$/);
  if (methodMatch) {
    const methodName = methodMatch[1];
    if (typeof context[methodName] === 'function') {
      const val = context[methodName]();
      return isNegated ? !val : val;
    }
  }

  // Handle literals
  if (cleanExpr === 'true') return !isNegated ? true : false;
  if (cleanExpr === 'false') return !isNegated ? false : true;
  if (!isNaN(Number(cleanExpr))) return !isNegated ? Number(cleanExpr) : false;
  if (cleanExpr.startsWith("'") && cleanExpr.endsWith("'")) return !isNegated ? cleanExpr.slice(1, -1) : false;
  if (cleanExpr.startsWith('"') && cleanExpr.endsWith('"')) return !isNegated ? cleanExpr.slice(1, -1) : false;

  const val = cleanExpr.split('.').reduce((acc, part) => acc && acc[part], context);
  return isNegated ? !val : val;
}

export function parseObjectLiteral(expr: string): Record<string, string> {
  const result: Record<string, string> = {};
  const cleanExpr = expr.trim().replace(/^\{|\}$/g, '');
  if (!cleanExpr) return result;
  
  const pairs = cleanExpr.split(',');
  for (const pair of pairs) {
    const [keyPart, ...valParts] = pair.split(':');
    if (keyPart && valParts.length > 0) {
      let key = keyPart.trim();
      key = key.replace(/^['"]|['"]$/g, '');
      result[key] = valParts.join(':').trim();
    }
  }
  return result;
}

export function setValue(context: any, expr: string, value: any): void {
  const parts = expr.split('.');
  const last = parts.pop()!;
  const target = parts.reduce((acc, part) => acc && acc[part], context);
  if (target) {
    target[last] = value;
  }
}
