export function createReactiveProxy<T extends object>(instance: T, onUpdate: () => void): T {
  let pendingUpdate = false;
  return new Proxy(instance, {
    set(target, prop, value) {
      (target as any)[prop] = value;
      if (!pendingUpdate) {
        pendingUpdate = true;
        queueMicrotask(() => {
          onUpdate();
          pendingUpdate = false;
        });
      }
      return true;
    }
  });
}
