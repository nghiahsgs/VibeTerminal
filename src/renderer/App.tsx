/**
 * VibeTerminal - Main App
 * Multi-tab terminal with split panes, image paste, and themes
 */
import { useState, useCallback } from 'react'
import { TerminalTabs } from './components/terminal-tabs'
import { SplitContainer } from './components/split-container'
import { ThemeProvider, useTheme } from './hooks/use-theme'
import { ImageOverlay } from './components/image-overlay'

function AppContent() {
  const { theme, themeName, cycleTheme } = useTheme()
  const [pastedImage, setPastedImage] = useState<string | null>(null)

  const handleImagePaste = useCallback((dataUrl: string) => {
    setPastedImage(dataUrl)
  }, [])

  return (
    <div
      className="app"
      style={{
        background: theme.background,
        color: theme.foreground,
        '--accent': theme.accent,
        '--border': theme.border,
        '--tab-bg': theme.tabBg,
        '--tab-active-bg': theme.tabActiveBg,
        '--hover': theme.hover,
        '--drag-region-height': '38px'
      } as React.CSSProperties}
    >
      {/* Title bar drag region */}
      <div className="titlebar">
        <div className="titlebar-drag" />
        <span className="titlebar-title">VibeTerminal</span>
        <button className="titlebar-theme-btn" onClick={cycleTheme} title={`Theme: ${themeName}`}>
          ◐
        </button>
      </div>

      {/* Main content */}
      <SplitContainer onImagePaste={handleImagePaste} />

      {/* Image overlay when pasted */}
      {pastedImage && (
        <ImageOverlay src={pastedImage} onClose={() => setPastedImage(null)} />
      )}
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
