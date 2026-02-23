# VibeTerminal

A modern terminal app with image paste, split panes, and beautiful themes.

Built with Electron + xterm.js + node-pty.

## Features

- **Multi-tab terminals** - Cmd+T to create, Cmd+W to close
- **Split panes** - Cmd+D to split, Cmd+Shift+D to toggle direction
- **Image paste** - Paste or drag-drop images directly into terminal
- **Beautiful themes** - Tokyo Night, Catppuccin, Dracula, Rose Pine
- **WebGL rendering** - Smooth 60fps terminal output
- **Web links** - Clickable URLs in terminal output
- **Custom fonts** - JetBrains Mono, Fira Code, SF Mono

## Quick Start

```bash
npm install
npm run rebuild   # Build native modules (node-pty)
npm run dev       # Start development
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+T | New tab |
| Cmd+W | Close tab |
| Cmd+D | Split pane |
| Cmd+Shift+D | Toggle split direction |

## Build

```bash
npm run build     # Production build
npm run dist      # Package for macOS
npm run dist:win  # Package for Windows
npm run dist:linux # Package for Linux
```

## Architecture

```
src/
├── main/              # Electron main process
│   ├── index.ts       # App entry, window creation, IPC
│   └── pty-manager.ts # Terminal shell management
├── preload/           # IPC bridge
│   ├── index.ts       # contextBridge APIs
│   └── index.d.ts     # Type definitions
└── renderer/          # React frontend
    ├── App.tsx        # Main layout
    ├── components/
    │   ├── terminal-instance.tsx  # xterm.js wrapper
    │   ├── terminal-tabs.tsx      # Tab management
    │   ├── split-container.tsx    # Split pane system
    │   └── image-overlay.tsx      # Image preview
    ├── hooks/
    │   └── use-theme.tsx          # Theme system
    └── styles/
        └── global.css             # Styling
```
