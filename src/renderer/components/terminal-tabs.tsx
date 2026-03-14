/**
 * Terminal tabs bar - manage multiple terminal instances
 * Double-click to rename, drag to reorder
 */
import { useState, useRef, useEffect } from 'react'

interface Tab {
  id: string
  name: string
}

interface Props {
  tabs: Tab[]
  activeId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
  onRename?: (id: string, name: string) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export function TerminalTabs({ tabs, activeId, onSelect, onClose, onNew, onRename, onReorder }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragItemIndex = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const startRename = (tab: Tab) => {
    setEditingId(tab.id)
    setEditValue(tab.name)
  }

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRename?.(editingId, editValue.trim())
    }
    setEditingId(null)
  }

  const handleDragStart = (index: number) => {
    dragItemIndex.current = index
  }

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault()
    setDragOverId(tabId)
  }

  const handleDrop = (toIndex: number) => {
    const fromIndex = dragItemIndex.current
    if (fromIndex !== null && fromIndex !== toIndex) {
      onReorder?.(fromIndex, toIndex)
    }
    dragItemIndex.current = null
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    dragItemIndex.current = null
    setDragOverId(null)
  }

  return (
    <div className="terminal-tabs">
      <div className="tabs-list">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeId ? 'active' : ''} ${tab.id === dragOverId ? 'drag-over' : ''}`}
            onClick={() => onSelect(tab.id)}
            draggable={editingId !== tab.id}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
          >
            <span className="tab-icon">❯</span>
            {editingId === tab.id ? (
              <input
                ref={inputRef}
                className="tab-rename-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') setEditingId(null)
                  e.stopPropagation()
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="tab-name"
                onDoubleClick={(e) => { e.stopPropagation(); startRename(tab) }}
              >
                {tab.name}
              </span>
            )}
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => { e.stopPropagation(); onClose(tab.id) }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="tabs-actions">
        <button className="tab-action-btn" onClick={onNew} title="New Terminal (⌘T)">
          +
        </button>
      </div>
    </div>
  )
}
