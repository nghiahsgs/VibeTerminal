/**
 * PTY Manager - Manages terminal shell processes via node-pty
 */
import * as pty from 'node-pty'
import os from 'os'
import fs from 'fs'

interface PtyInstance {
  process: pty.IPty
  onDataCallback: (data: string) => void
  initialCwd: string
  createdAt: number
  restartCount: number
}

const MAX_RESTART_ATTEMPTS = 3
const RESTART_DELAY_MS = 1500
const CRASH_WINDOW_MS = 5000

export class PtyManager {
  private instances: Map<string, PtyInstance> = new Map()

  private findShell(): string {
    if (os.platform() === 'win32') return 'powershell.exe'

    const shells = ['/bin/zsh', '/bin/bash', '/bin/sh']
    for (const shell of shells) {
      try {
        if (fs.existsSync(shell) && fs.statSync(shell).isFile()) return shell
      } catch {
        // continue
      }
    }
    return '/bin/sh'
  }

  create(id: string, onData: (data: string) => void, cwd?: string, restartCount = 0): void {
    this.kill(id)

    const shell = this.findShell()
    const shellArgs = os.platform() === 'win32' ? [] : ['-l']
    const homeDir = os.homedir()
    const workingDir = cwd || homeDir

    try {
      const env: Record<string, string> = {}
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined) env[key] = value
      }
      env.TERM = 'xterm-256color'
      env.COLORTERM = 'truecolor'
      env.LANG = env.LANG || 'en_US.UTF-8'
      env.HOME = homeDir
      env.SHELL = shell

      const ptyProcess = pty.spawn(shell, shellArgs, {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: workingDir,
        env
      })

      ptyProcess.onData(onData)

      ptyProcess.onExit(({ exitCode }) => {
        console.log(`[PTY] Terminal ${id} exited (code ${exitCode})`)
        const instance = this.instances.get(id)
        const wasQuickExit = instance && (Date.now() - instance.createdAt) < CRASH_WINDOW_MS
        this.instances.delete(id)

        if (wasQuickExit && instance && instance.restartCount < MAX_RESTART_ATTEMPTS) {
          setTimeout(() => {
            this.create(id, instance.onDataCallback, instance.initialCwd, instance.restartCount + 1)
          }, RESTART_DELAY_MS)
        }
      })

      this.instances.set(id, {
        process: ptyProcess,
        onDataCallback: onData,
        initialCwd: workingDir,
        createdAt: Date.now(),
        restartCount
      })
    } catch (error) {
      onData(`\r\n\x1b[31mError: Failed to spawn shell (${shell})\x1b[0m\r\n`)
      if (restartCount < MAX_RESTART_ATTEMPTS) {
        setTimeout(() => this.create(id, onData, workingDir, restartCount + 1), RESTART_DELAY_MS)
      }
    }
  }

  write(id: string, data: string): void {
    this.instances.get(id)?.process.write(data)
  }

  resize(id: string, cols: number, rows: number): void {
    this.instances.get(id)?.process.resize(cols, rows)
  }

  kill(id: string): void {
    const instance = this.instances.get(id)
    if (instance) {
      instance.process.kill()
      this.instances.delete(id)
    }
  }

  killAll(): void {
    for (const [id] of this.instances) this.kill(id)
  }

  async getCwd(id: string): Promise<string> {
    const instance = this.instances.get(id)
    if (!instance) return os.homedir()

    const pid = instance.process.pid
    try {
      if (os.platform() === 'darwin') {
        const { execSync } = await import('child_process')
        const output = execSync(`lsof -p ${pid} 2>/dev/null | grep ' cwd ' | awk '{print $NF}'`, {
          encoding: 'utf8', timeout: 1000
        }).trim()
        if (output) return output
      } else if (os.platform() === 'linux') {
        const cwdLink = `/proc/${pid}/cwd`
        if (fs.existsSync(cwdLink)) return fs.readlinkSync(cwdLink)
      }
    } catch {
      // fallback
    }
    return instance.initialCwd
  }
}
