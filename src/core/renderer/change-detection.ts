export function createArrayProxy(array: any[], onChange: () => void): any[] {
  return new Proxy(array, {
    get(target, prop) {
      const value = target[prop as any];
      if (['push', 'pop', 'splice', 'shift', 'unshift'].includes(prop as string)) {
        return (...args: any[]) => {
          const result = (value as Function).apply(target, args);
          onChange();
          return result;
        };
      }
      return value;
    },
    set(target, prop, value) {
      target[prop as any] = value;
      onChange();
      return true;
    }
  });
}

export function createReactiveProxy<T extends object>(instance: T, onUpdate: () => void): T {
  let pendingUpdate = false;
  
  const triggerUpdate = () => {
    if (!pendingUpdate) {
      pendingUpdate = true;
      queueMicrotask(() => {
        onUpdate();
        pendingUpdate = false;
      });
    }
  };

  // Wrap existing arrays upon initialization
  for (const key in instance) {
    if (Array.isArray(instance[key])) {
      (instance as any)[key] = createArrayProxy(instance[key], triggerUpdate);
    }
  }

  return new Proxy(instance, {
    set(target, prop, value) {
      if (Array.isArray(value)) {
        (target as any)[prop] = createArrayProxy(value, triggerUpdate);
      } else {
        (target as any)[prop] = value;
      }
      triggerUpdate();
      return true;
    }
  });
}
