export interface TerminalAPI {
  create: (id: string, cwd?: string) => Promise<void>
  write: (id: string, data: string) => void
  resize: (id: string, cols: number, rows: number) => void
  kill: (id: string) => Promise<void>
  getCwd: (id: string) => Promise<string>
  onData: (callback: (payload: { id: string; data: string }) => void) => () => void
}

export interface AppAPI {
  getTheme: () => Promise<'dark' | 'light'>
}

declare global {
  interface Window {
    terminal: TerminalAPI
    app: AppAPI
  }
}
