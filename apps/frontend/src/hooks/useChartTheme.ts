import { useEffect, useState } from 'react';

interface ChartTheme {
  grid: string;
  text: string;
}

function readChartTheme(): ChartTheme {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  return {
    grid: style.getPropertyValue('--chart-grid').trim() || 'hsl(222 47% 13%)',
    text: style.getPropertyValue('--chart-text').trim() || 'hsl(215 16% 47%)',
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>({ grid: 'hsl(222 47% 13%)', text: 'hsl(215 16% 47%)' });

  useEffect(() => {
    // Read immediately
    setTheme(readChartTheme());

    // Re-read when CSS variables change (theme switch)
    const observer = new MutationObserver(() => setTheme(readChartTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
