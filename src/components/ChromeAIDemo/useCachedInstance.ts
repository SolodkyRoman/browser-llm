// Caches a single instance keyed by a string. When the key changes (e.g. different
// summary type or language pair), the cached instance is invalidated and must be re-created.

import { useRef } from 'react';

export const useCachedInstance = <T>() => {
  const instanceRef = useRef<T | null>(null);
  const lastKeyRef = useRef('');

  return {
    resolve(key: string): T | null {
      if (key !== lastKeyRef.current) {
        instanceRef.current = null;
        lastKeyRef.current = key;
      }
      return instanceRef.current;
    },
    set(instance: T) {
      instanceRef.current = instance;
    },
  };
};
