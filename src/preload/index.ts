/**
 * Preload - Exposes safe IPC APIs to renderer
 */
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('terminal', {
  create: (id: string, cwd?: string) => ipcRenderer.invoke('terminal:create', id, cwd),
  write: (id: string, data: string) => ipcRenderer.send('terminal:write', id, data),
  resize: (id: string, cols: number, rows: number) => ipcRenderer.send('terminal:resize', id, cols, rows),
  kill: (id: string) => ipcRenderer.invoke('terminal:kill', id),
  getCwd: (id: string) => ipcRenderer.invoke('terminal:getCwd', id),
  onData: (callback: (payload: { id: string; data: string }) => void) => {
    const handler = (_: Electron.IpcRendererEvent, payload: { id: string; data: string }) => callback(payload)
    ipcRenderer.on('terminal:data', handler)
    return () => ipcRenderer.removeListener('terminal:data', handler)
  }
})

contextBridge.exposeInMainWorld('app', {
  getTheme: () => ipcRenderer.invoke('app:getTheme'),
  openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url)
})
