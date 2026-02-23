/**
 * Terminal tabs bar - manage multiple terminal instances
 */
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
}

export function TerminalTabs({ tabs, activeId, onSelect, onClose, onNew }: Props) {
  return (
    <div className="terminal-tabs">
      <div className="tabs-list">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(tab.id)}
          >
            <span className="tab-icon">❯</span>
            <span className="tab-name">{tab.name}</span>
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
