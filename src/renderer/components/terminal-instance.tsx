/**
 * Single terminal instance - xterm.js with addons
 * Handles image paste, WebGL rendering, web links
 */
import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { useTheme } from '../hooks/use-theme'
import '@xterm/xterm/css/xterm.css'

interface Props {
  id: string
  isActive: boolean
  cwd?: string
  onImagePaste?: (dataUrl: string) => void
}

export function TerminalInstance({ id, isActive, cwd, onImagePaste }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const initializedRef = useRef(false)
  const { xtermTheme } = useTheme()

  // Initialize terminal once
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return
    initializedRef.current = true

    const container = containerRef.current

    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Menlo, Monaco, "Courier New", monospace',
      fontWeight: '400',
      lineHeight: 1.3,
      letterSpacing: 0.5,
      scrollback: 10000,
      allowProposedApi: true,
      theme: xtermTheme
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(new WebLinksAddon())

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    terminal.open(container)

    // Create PTY
    window.terminal.create(id, cwd)

    // PTY data -> terminal
    const removeDataListener = window.terminal.onData(({ id: dataId, data }) => {
      if (dataId === id) terminal.write(data)
    })

    // Terminal input -> PTY
    const inputDisposable = terminal.onData((data) => {
      window.terminal.write(id, data)
    })

    // Fit and resize
    setTimeout(() => {
      fitAddon.fit()
      const { cols, rows } = terminal
      window.terminal.resize(id, cols, rows)
      if (isActive) terminal.focus()
    }, 150)

    return () => {
      initializedRef.current = false
      removeDataListener()
      inputDisposable.dispose()
      window.terminal.kill(id)
      terminal.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [id, cwd])

  // Update theme when it changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.options.theme = xtermTheme
    }
  }, [xtermTheme])

  // Handle visibility and focus
  useEffect(() => {
    if (isActive && terminalRef.current && fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current!.fit()
        const { cols, rows } = terminalRef.current!
        window.terminal.resize(id, cols, rows)
        terminalRef.current!.focus()
      }, 50)
    }
  }, [isActive, id])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current || !isActive) return

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (fitAddonRef.current && terminalRef.current) {
          fitAddonRef.current.fit()
          const { cols, rows } = terminalRef.current
          window.terminal.resize(id, cols, rows)
        }
      })
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [isActive, id])

  // Image paste handler
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (!blob) continue

        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          onImagePaste?.(dataUrl)

          // Also write a placeholder to terminal
          terminalRef.current?.write('\r\n\x1b[36m[Image pasted - see overlay]\x1b[0m\r\n')
        }
        reader.readAsDataURL(blob)
        return
      }
    }
  }, [onImagePaste])

  // Drag and drop image
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (!files) return

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          onImagePaste?.(reader.result as string)
          terminalRef.current?.write('\r\n\x1b[36m[Image dropped - see overlay]\x1b[0m\r\n')
        }
        reader.readAsDataURL(file)
        return
      }
    }
  }, [onImagePaste])

  return (
    <div
      ref={containerRef}
      className="terminal-instance"
      style={{ display: isActive ? 'block' : 'none', height: '100%' }}
      onClick={() => terminalRef.current?.focus()}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    />
  )
}
