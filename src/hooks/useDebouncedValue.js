import { useEffect, useRef, useState } from 'react';

export default function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef(0);

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer.current);
  }, [value, delay]);

  return debounced;
}
