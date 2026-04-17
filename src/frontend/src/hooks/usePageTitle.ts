import { useEffect } from 'react';

const SUFFIX = 'Amber | Culture Match';

/**
 * Sets document.title to "Page · Prj Amber".
 * Pass an empty string to show just "Prj Amber".
 */
export function usePageTitle(page: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = page ? `${page} · ${SUFFIX}` : SUFFIX;
    return () => {
      document.title = prev;
    };
  }, [page]);
}
