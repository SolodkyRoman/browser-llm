import { useRef, useEffect } from 'react';

export const useDebouncedEffect = (
  fn: () => void,
  deps: unknown[],
  delay: number,
  enabled: boolean,
) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!enabled) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, deps);
};
