/**
 * VibeTerminal - Main Process
 * Electron app entry point
 */
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron'
import { join } from 'path'
import { PtyManager } from './pty-manager'

const ptyManager = new PtyManager()
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    backgroundColor: '#1a1b26',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  // Load renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// --- IPC Handlers ---

ipcMain.handle('terminal:create', (_, id: string, cwd?: string) => {
  ptyManager.create(id, (data) => {
    mainWindow?.webContents.send('terminal:data', { id, data })
  }, cwd)
})

ipcMain.on('terminal:write', (_, id: string, data: string) => {
  ptyManager.write(id, data)
})

ipcMain.on('terminal:resize', (_, id: string, cols: number, rows: number) => {
  ptyManager.resize(id, cols, rows)
})

ipcMain.handle('terminal:kill', (_, id: string) => {
  ptyManager.kill(id)
})

ipcMain.handle('terminal:getCwd', async (_, id: string) => {
  return ptyManager.getCwd(id)
})

ipcMain.handle('app:openExternal', (_, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle('app:getTheme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
})

// --- App Lifecycle ---

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  ptyManager.killAll()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
