import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'indigo' | 'cyan' | 'emerald' | 'amber' | 'red' | 'violet';

interface AccentDef {
  label: string;
  hex: string;
  // HSL values used to override CSS variables
  primary: string;       // hsl values for --primary / --ring
  primaryFg: string;     // hsl values for --primary-foreground
  accent: string;        // hsl values for --accent (gradient end)
}

export const ACCENT_MAP: Record<AccentColor, AccentDef> = {
  indigo:  { label: 'Indigo',  hex: '#6366f1', primary: '239 84% 67%', primaryFg: '0 0% 100%', accent: '189 94% 43%' },
  cyan:    { label: 'Cyan',    hex: '#06b6d4', primary: '189 94% 43%', primaryFg: '0 0% 100%', accent: '239 84% 67%' },
  emerald: { label: 'Emerald', hex: '#10b981', primary: '160 84% 39%', primaryFg: '0 0% 100%', accent: '189 94% 43%' },
  amber:   { label: 'Amber',   hex: '#f59e0b', primary: '38 92% 50%',  primaryFg: '0 0% 0%',   accent: '30 100% 55%' },
  red:     { label: 'Red',     hex: '#ef4444', primary: '0 84% 60%',   primaryFg: '0 0% 100%', accent: '0 72% 51%'   },
  violet:  { label: 'Violet',  hex: '#8b5cf6', primary: '263 70% 64%', primaryFg: '0 0% 100%', accent: '239 84% 67%' },
};

const DARK_BASE = {
  '--background':           '222 47% 5%',
  '--foreground':           '213 31% 91%',
  '--card':                 '222 47% 7%',
  '--card-foreground':      '213 31% 91%',
  '--popover':              '222 47% 7%',
  '--popover-foreground':   '213 31% 91%',
  '--secondary':            '222 47% 11%',
  '--secondary-foreground': '213 31% 91%',
  '--muted':                '222 47% 11%',
  '--muted-foreground':     '215 16% 47%',
  '--destructive':          '0 63% 31%',
  '--destructive-foreground':'0 0% 100%',
  '--border':               '222 47% 13%',
  '--input':                '222 47% 13%',
  '--radius':               '0.75rem',
  '--sidebar-background':   '222 47% 6%',
  '--sidebar-foreground':   '213 31% 91%',
  '--sidebar-border':       '222 47% 11%',
};

const LIGHT_BASE = {
  '--background':           '0 0% 98%',
  '--foreground':           '222 47% 11%',
  '--card':                 '0 0% 100%',
  '--card-foreground':      '222 47% 11%',
  '--popover':              '0 0% 100%',
  '--popover-foreground':   '222 47% 11%',
  '--secondary':            '220 14% 94%',
  '--secondary-foreground': '222 47% 11%',
  '--muted':                '220 14% 94%',
  '--muted-foreground':     '215 16% 46%',
  '--destructive':          '0 84% 60%',
  '--destructive-foreground':'0 0% 100%',
  '--border':               '220 13% 88%',
  '--input':                '220 13% 88%',
  '--radius':               '0.75rem',
  '--sidebar-background':   '220 14% 96%',
  '--sidebar-foreground':   '222 47% 11%',
  '--sidebar-border':       '220 13% 88%',
};

function applyTheme(mode: ThemeMode, accent: AccentColor) {
  const root = document.documentElement;
  const base = mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const accentDef = ACCENT_MAP[accent];

  // Apply base variables
  for (const [key, val] of Object.entries(base)) {
    root.style.setProperty(key, val);
  }

  // Glass surface variables
  if (mode === 'dark') {
    root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.03)');
    root.style.setProperty('--glass-border', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--glass-hover-bg', 'rgba(255,255,255,0.05)');
    root.style.setProperty('--glass-hover-border', 'rgba(255,255,255,0.12)');
    root.style.setProperty('--chart-grid', 'hsl(222 47% 13%)');
    root.style.setProperty('--chart-text', 'hsl(215 16% 47%)');
    root.style.setProperty('--shimmer-highlight', 'rgba(255,255,255,0.04)');
  } else {
    root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.7)');
    root.style.setProperty('--glass-border', 'rgba(0,0,0,0.08)');
    root.style.setProperty('--glass-hover-bg', 'rgba(255,255,255,0.85)');
    root.style.setProperty('--glass-hover-border', 'rgba(0,0,0,0.14)');
    root.style.setProperty('--chart-grid', 'hsl(220 13% 88%)');
    root.style.setProperty('--chart-text', 'hsl(215 16% 46%)');
    root.style.setProperty('--shimmer-highlight', 'rgba(0,0,0,0.04)');
  }

  // Apply accent variables
  root.style.setProperty('--primary', accentDef.primary);
  root.style.setProperty('--primary-foreground', accentDef.primaryFg);
  root.style.setProperty('--accent', accentDef.accent);
  root.style.setProperty('--accent-foreground', accentDef.primaryFg);
  root.style.setProperty('--ring', accentDef.primary);
  root.style.setProperty('--sidebar-accent', accentDef.primary);
  root.style.setProperty('--sidebar-accent-foreground', accentDef.primaryFg);

  // Toggle class for CSS selectors that use .dark / .light
  root.classList.toggle('dark', mode === 'dark');
  root.classList.toggle('light', mode === 'light');

  // Update gradient utilities to reflect accent
  // We expose a CSS custom property for JS-gradient classes
  root.style.setProperty('--gradient-from', `hsl(${accentDef.primary})`);
  root.style.setProperty('--gradient-to', `hsl(${accentDef.accent})`);
}

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentColor;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  accent: 'indigo',
  setMode: () => undefined,
  setAccent: () => undefined,
});

const STORAGE_MODE   = 'hospital_theme_mode';
const STORAGE_ACCENT = 'hospital_theme_accent';

function readMode(): ThemeMode {
  const v = localStorage.getItem(STORAGE_MODE);
  return v === 'light' ? 'light' : 'dark';
}

function readAccent(): AccentColor {
  const v = localStorage.getItem(STORAGE_ACCENT);
  return (v && v in ACCENT_MAP) ? (v as AccentColor) : 'indigo';
}

// Immediately apply stored theme before React renders (prevents flash)
applyTheme(readMode(), readAccent());

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [accent, setAccentState] = useState<AccentColor>(readAccent);

  useEffect(() => {
    applyTheme(mode, accent);
  }, [mode, accent]);

  const setMode = (m: ThemeMode) => {
    localStorage.setItem(STORAGE_MODE, m);
    setModeState(m);
  };

  const setAccent = (a: AccentColor) => {
    localStorage.setItem(STORAGE_ACCENT, a);
    setAccentState(a);
  };

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
