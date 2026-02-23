# VibeTerminal

A modern terminal built for developers who work with AI coding agents like **Claude Code** on macOS. Smoother typing, zero input lag, beautiful themes.

## Why Not the Default Terminal?

| | macOS Terminal / iTerm2 | VibeTerminal |
|---|---|---|
| **Typing feel** | Can stutter — characters appear late when shell is busy | Instant keystroke rendering via Xterm.js, no "dragging characters" |
| **Rendering** | CPU-based text drawing | GPU-accelerated (WebGL) at 60fps |
| **Architecture** | Single-process — heavy shell output blocks input | Multi-process — UI thread is never blocked by PTY output |
| **Buffering** | Raw stream, can choke on large output | Smart buffering with throttled rendering |
| **Theming** | Limited or requires third-party config | 4 built-in themes, one-click switch |
| **Image handling** | No native support | Paste or drag-drop images directly |
| **Split panes** | iTerm2 only, Terminal.app has none | Built-in split panes with tabs |

### The Core Idea

When running Claude Code, your terminal receives **massive streams of AI-generated output** while you're still typing. Default terminals render everything synchronously — shell output and your keystrokes compete for the same thread, causing the "dragging characters" effect.

VibeTerminal separates concerns:

```
You (keystrokes) ─→ Xterm.js ─→ IPC ─→ PTY Manager ─→ Shell (zsh/bash)
                     ↑                       ↓
                  GPU render ←── IPC ←── Buffered output
```

- **Input path**: keystrokes go straight to the renderer — you see them immediately
- **Output path**: shell data is buffered and rendered in batches via `requestAnimationFrame`
- **Result**: typing feels instant even when Claude Code is streaming thousands of lines

## Features

- **GPU-accelerated rendering** — WebGL-powered Xterm.js, smooth 60fps output
- **Multi-tab terminals** — `Cmd+T` to create, `Cmd+W` to close
- **Split panes** — `Cmd+D` to split, `Cmd+Shift+D` to toggle direction
- **Image paste** — paste (`Cmd+V`) or drag-drop images directly into terminal
- **Beautiful themes** — Tokyo Night, Catppuccin Mocha, Dracula, Rose Pine
- **Clickable URLs** — web links in terminal output are interactive
- **Custom fonts** — JetBrains Mono, Fira Code, SF Mono
- **Auto-restart** — crashed shell sessions recover automatically (up to 3 retries)
- **Native macOS feel** — hidden title bar with traffic lights, drag region

## Quick Start

```bash
npm install
npm run rebuild   # Build native module (node-pty)
npm run dev       # Start development
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+T` | New tab |
| `Cmd+W` | Close tab |
| `Cmd+D` | Split pane |
| `Cmd+Shift+D` | Toggle split direction (horizontal/vertical) |

## Download & Install

### macOS (Apple Silicon)

1. Download `VibeTerminal-x.x.x-arm64.dmg` from [Releases](https://github.com/nghiahsgs/VibeTerminal/releases)
2. Open the DMG and drag **VibeTerminal** into **Applications**
3. Open VibeTerminal from Applications — it's signed and notarized by Apple, so it should open without any warnings

> **If macOS shows "VibeTerminal can't be opened"** (Gatekeeper warning), use one of these methods:
>
> **Method 1** — Right-click → Open:
> Right-click (or Control-click) on VibeTerminal in Applications → click **Open** → click **Open** again in the dialog
>
> **Method 2** — Terminal command:
> ```bash
> xattr -cr /Applications/VibeTerminal.app
> ```
>
> **Method 3** — System Settings:
> Go to **System Settings → Privacy & Security** → scroll down → click **Open Anyway** next to the VibeTerminal message

## Build from Source

```bash
npm install
npm run rebuild    # Build native module (node-pty)
npm run build      # Production build
npm run dist       # Package for macOS (.dmg)
npm run dist:win   # Package for Windows
npm run dist:linux # Package for Linux
```

### Build with Notarization (macOS)

To build a notarized DMG that opens without Gatekeeper warnings:

```bash
APPLE_ID=your@email.com \
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx \
APPLE_TEAM_ID=YOUR_TEAM_ID \
npm run dist
```

**Prerequisites:**
- Apple Developer account ($99/year)
- "Developer ID Application" certificate installed in Keychain
- App-Specific Password from [appleid.apple.com](https://appleid.apple.com) (Sign-In and Security > App-Specific Passwords)

## Architecture

```
Electron Main Process          Renderer Process (React)
┌─────────────────────┐       ┌──────────────────────────┐
│  PtyManager         │       │  App                     │
│  ├─ node-pty spawn  │◄─IPC─►│  ├─ SplitContainer       │
│  ├─ shell lifecycle │       │  │  ├─ TerminalTabs       │
│  ├─ resize signals  │       │  │  └─ TerminalInstance   │
│  └─ auto-restart    │       │  │     └─ Xterm.js + WebGL│
│                     │       │  ├─ ThemeProvider          │
│                     │       │  └─ ImageOverlay           │
└─────────────────────┘       └──────────────────────────┘
```

```
src/
├── main/              # Electron main process
│   ├── index.ts       # App entry, window creation, IPC handlers
│   └── pty-manager.ts # Terminal shell management (node-pty)
├── preload/           # Secure IPC bridge
│   ├── index.ts       # contextBridge APIs
│   └── index.d.ts     # Type definitions
└── renderer/          # React frontend
    ├── App.tsx        # Main layout + image overlay
    ├── main.tsx       # Entry point
    ├── components/
    │   ├── terminal-instance.tsx  # Xterm.js wrapper + addons
    │   ├── terminal-tabs.tsx      # Tab bar
    │   ├── split-container.tsx    # Split pane system + shortcuts
    │   └── image-overlay.tsx      # Image preview modal
    ├── hooks/
    │   └── use-theme.tsx          # Theme system (4 themes)
    └── styles/
        └── global.css             # UI styling + custom scrollbar
```

## Tech Stack

- **Electron** — cross-platform desktop shell
- **node-pty** — native PTY management (same library used by VS Code)
- **Xterm.js** — terminal frontend with WebGL addon for GPU rendering
- **React 18** — UI components
- **electron-vite** — fast HMR development
- **TypeScript** — type safety throughout

## License

MIT
