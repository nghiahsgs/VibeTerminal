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

  // Keep activePaneId in sync when panes are removed
  useEffect(() => {
    if (panes.length > 0 && !panes.find(p => p.id === activePaneId)) {
      setActivePaneId(panes[panes.length - 1].id)
    }
  }, [panes, activePaneId])

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

  // Close tab (removes pane when last tab is closed, unless it's the only pane)
  const closeTab = useCallback((paneId: string, tabId: string) => {
    setPanes(prev => {
      const updated = prev.map(pane => {
        if (pane.id !== paneId) return pane
        const filtered = pane.tabs.filter(t => t.id !== tabId)
        // Keep pane with empty tabs temporarily — filtered below
        return {
          ...pane,
          tabs: filtered,
          activeTabId: filtered.length > 0
            ? (tabId === pane.activeTabId ? filtered[filtered.length - 1].id : pane.activeTabId)
            : null
        }
      })

      // Remove empty panes, but always keep at least one pane
      const nonEmpty = updated.filter(pane => pane.tabs.length > 0)
      if (nonEmpty.length === 0) {
        // Last pane's last tab — keep the pane with one tab
        return prev
      }
      return nonEmpty
    })

    // Update active pane if current was removed
    setActivePaneId(prev => {
      // Will be validated in next render
      return prev
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
      // Cmd+1-9: switch to tab by index in active pane
      const num = parseInt(e.key)
      if (isMeta && num >= 1 && num <= 9) {
        e.preventDefault()
        const pane = panes.find(p => p.id === activePaneId)
        if (pane) {
          const tabIndex = num - 1
          const tab = pane.tabs[tabIndex]
          if (tab) {
            setPanes(prev => prev.map(p =>
              p.id === pane.id ? { ...p, activeTabId: tab.id } : p
            ))
          }
        }
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
                  isActive={tab.id === pane.activeTabId}
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
