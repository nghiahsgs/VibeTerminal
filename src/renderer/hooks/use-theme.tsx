/**
 * Theme system - Multiple beautiful terminal themes
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface TerminalTheme {
  name: string
  background: string
  foreground: string
  accent: string
  border: string
  tabBg: string
  tabActiveBg: string
  hover: string
  cursor: string
  selectionBg: string
  // ANSI colors
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightMagenta: string
  brightCyan: string
  brightWhite: string
}

const themes: Record<string, TerminalTheme> = {
  tokyoNight: {
    name: 'Tokyo Night',
    background: '#1a1b26',
    foreground: '#c0caf5',
    accent: '#7aa2f7',
    border: '#292e42',
    tabBg: '#16161e',
    tabActiveBg: '#1a1b26',
    hover: '#292e42',
    cursor: '#c0caf5',
    selectionBg: '#283457',
    black: '#15161e',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#bb9af7',
    cyan: '#7dcfff',
    white: '#a9b1d6',
    brightBlack: '#414868',
    brightRed: '#f7768e',
    brightGreen: '#9ece6a',
    brightYellow: '#e0af68',
    brightBlue: '#7aa2f7',
    brightMagenta: '#bb9af7',
    brightCyan: '#7dcfff',
    brightWhite: '#c0caf5'
  },
  catppuccin: {
    name: 'Catppuccin Mocha',
    background: '#1e1e2e',
    foreground: '#cdd6f4',
    accent: '#89b4fa',
    border: '#313244',
    tabBg: '#181825',
    tabActiveBg: '#1e1e2e',
    hover: '#313244',
    cursor: '#f5e0dc',
    selectionBg: '#45475a',
    black: '#45475a',
    red: '#f38ba8',
    green: '#a6e3a1',
    yellow: '#f9e2af',
    blue: '#89b4fa',
    magenta: '#cba6f7',
    cyan: '#94e2d5',
    white: '#bac2de',
    brightBlack: '#585b70',
    brightRed: '#f38ba8',
    brightGreen: '#a6e3a1',
    brightYellow: '#f9e2af',
    brightBlue: '#89b4fa',
    brightMagenta: '#cba6f7',
    brightCyan: '#94e2d5',
    brightWhite: '#a6adc8'
  },
  dracula: {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    accent: '#bd93f9',
    border: '#44475a',
    tabBg: '#21222c',
    tabActiveBg: '#282a36',
    hover: '#44475a',
    cursor: '#f8f8f2',
    selectionBg: '#44475a',
    black: '#21222c',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
    brightBlack: '#6272a4',
    brightRed: '#ff6e6e',
    brightGreen: '#69ff94',
    brightYellow: '#ffffa5',
    brightBlue: '#d6acff',
    brightMagenta: '#ff92df',
    brightCyan: '#a4ffff',
    brightWhite: '#ffffff'
  },
  rosePine: {
    name: 'Rose Pine',
    background: '#191724',
    foreground: '#e0def4',
    accent: '#c4a7e7',
    border: '#26233a',
    tabBg: '#1f1d2e',
    tabActiveBg: '#191724',
    hover: '#26233a',
    cursor: '#e0def4',
    selectionBg: '#2a283e',
    black: '#26233a',
    red: '#eb6f92',
    green: '#31748f',
    yellow: '#f6c177',
    blue: '#9ccfd8',
    magenta: '#c4a7e7',
    cyan: '#ebbcba',
    white: '#e0def4',
    brightBlack: '#6e6a86',
    brightRed: '#eb6f92',
    brightGreen: '#31748f',
    brightYellow: '#f6c177',
    brightBlue: '#9ccfd8',
    brightMagenta: '#c4a7e7',
    brightCyan: '#ebbcba',
    brightWhite: '#e0def4'
  }
}

const themeKeys = Object.keys(themes)

interface ThemeContextValue {
  theme: TerminalTheme
  themeName: string
  cycleTheme: () => void
  xtermTheme: Record<string, string>
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeIndex, setThemeIndex] = useState(0)

  const cycleTheme = useCallback(() => {
    setThemeIndex(i => (i + 1) % themeKeys.length)
  }, [])

  const key = themeKeys[themeIndex]
  const theme = themes[key]

  const xtermTheme = {
    background: theme.background,
    foreground: theme.foreground,
    cursor: theme.cursor,
    cursorAccent: theme.background,
    selectionBackground: theme.selectionBg,
    black: theme.black,
    red: theme.red,
    green: theme.green,
    yellow: theme.yellow,
    blue: theme.blue,
    magenta: theme.magenta,
    cyan: theme.cyan,
    white: theme.white,
    brightBlack: theme.brightBlack,
    brightRed: theme.brightRed,
    brightGreen: theme.brightGreen,
    brightYellow: theme.brightYellow,
    brightBlue: theme.brightBlue,
    brightMagenta: theme.brightMagenta,
    brightCyan: theme.brightCyan,
    brightWhite: theme.brightWhite
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName: theme.name, cycleTheme, xtermTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
