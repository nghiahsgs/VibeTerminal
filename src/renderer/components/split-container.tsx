/**
 * Split Container - Manages split panes with multiple terminals
 * Supports horizontal and vertical splits
 */
import { useState, useCallback, useEffect } from 'react'
import { TerminalInstance } from './terminal-instance'
import { TerminalTabs } from './terminal-tabs'

interface TerminalTab {
  id: string
  name: string
  cwd?: string
}

interface SplitPane {
  id: string
  tabs: TerminalTab[]
  activeTabId: string | null
}

let counter = 0
const nextId = () => `term-${++counter}`

interface Props {
  onImagePaste?: (dataUrl: string) => void
}

export function SplitContainer({ onImagePaste }: Props) {
  const [panes, setPanes] = useState<SplitPane[]>([])
  const [activePaneId, setActivePaneId] = useState<string | null>(null)
  const [splitDirection, setSplitDirection] = useState<'horizontal' | 'vertical'>('horizontal')

  // Initialize first pane
  useEffect(() => {
    if (panes.length > 0) return
    const termId = nextId()
    const paneId = 'pane-1'
    setPanes([{
      id: paneId,
      tabs: [{ id: termId, name: 'zsh' }],
      activeTabId: termId
    }])
    setActivePaneId(paneId)
  }, [])

  // Add tab to active pane
  const addTab = useCallback(async () => {
    const termId = nextId()
    setPanes(prev => prev.map(pane => {
      if (pane.id !== activePaneId) return pane
      return {
        ...pane,
        tabs: [...pane.tabs, { id: termId, name: `zsh ${counter}` }],
        activeTabId: termId
      }
    }))
  }, [activePaneId])

  // Close tab
  const closeTab = useCallback((paneId: string, tabId: string) => {
    setPanes(prev => {
      return prev.map(pane => {
        if (pane.id !== paneId) return pane
        const filtered = pane.tabs.filter(t => t.id !== tabId)
        if (filtered.length === 0) return pane // Keep at least one tab
        return {
          ...pane,
          tabs: filtered,
          activeTabId: tabId === pane.activeTabId
            ? filtered[filtered.length - 1].id
            : pane.activeTabId
        }
      }).filter(pane => pane.tabs.length > 0)
    })
  }, [])

  // Split pane
  const splitPane = useCallback(() => {
    const termId = nextId()
    const paneId = `pane-${Date.now()}`
    setPanes(prev => [...prev, {
      id: paneId,
      tabs: [{ id: termId, name: `zsh ${counter}` }],
      activeTabId: termId
    }])
    setActivePaneId(paneId)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey

      // Cmd+T: new tab
      if (isMeta && e.key === 't') {
        e.preventDefault()
        addTab()
      }
      // Cmd+W: close tab
      if (isMeta && e.key === 'w') {
        e.preventDefault()
        const pane = panes.find(p => p.id === activePaneId)
        if (pane?.activeTabId) closeTab(pane.id, pane.activeTabId)
      }
      // Cmd+D: split
      if (isMeta && e.key === 'd') {
        e.preventDefault()
        splitPane()
      }
      // Cmd+Shift+D: toggle split direction
      if (isMeta && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setSplitDirection(d => d === 'horizontal' ? 'vertical' : 'horizontal')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [addTab, closeTab, splitPane, panes, activePaneId])

  return (
    <div className="split-container">
      <div className={`panes-wrapper ${splitDirection}`}>
        {panes.map(pane => (
          <div
            key={pane.id}
            className={`pane ${pane.id === activePaneId ? 'active-pane' : ''}`}
            onClick={() => setActivePaneId(pane.id)}
          >
            {/* Terminal content area */}
            <div className="pane-content">
              {pane.tabs.map(tab => (
                <TerminalInstance
                  key={tab.id}
                  id={tab.id}
                  isActive={tab.id === pane.activeTabId && pane.id === activePaneId}
                  cwd={tab.cwd}
                  onImagePaste={onImagePaste}
                />
              ))}
            </div>

            {/* Tabs bar at bottom */}
            <TerminalTabs
              tabs={pane.tabs}
              activeId={pane.activeTabId}
              onSelect={(tabId) => {
                setPanes(prev => prev.map(p =>
                  p.id === pane.id ? { ...p, activeTabId: tabId } : p
                ))
              }}
              onClose={(tabId) => closeTab(pane.id, tabId)}
              onNew={addTab}
            />
          </div>
        ))}
      </div>

      {/* Split controls */}
      {panes.length > 0 && (
        <div className="split-controls">
          <button
            className="split-btn"
            onClick={splitPane}
            title={`Split ${splitDirection} (⌘D)`}
          >
            {splitDirection === 'horizontal' ? '⊞' : '⊟'}
          </button>
        </div>
      )}
    </div>
  )
}
