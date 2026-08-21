# Ubuntu Camera & Audio Recorder

A modern desktop-grade Camera and Audio Recording application built for Ubuntu Linux with React, Vite, TypeScript, Tailwind CSS, and Electron.

---

## Features

- **Live Viewfinder & Still Capture**: Real-time camera streaming with rule-of-thirds composition grid, horizontal mirroring, and instant PNG snapshot capture.
- **Acoustic Spectrum & VU Metering**: Real-time frequency analysis, decibel metering, audio device routing, and voice track recording.
- **Combined Studio Recorder**: Synchronized camera and microphone recording with pause, resume, quality presets, and duration timers.
- **Recordings Library**: Browse, search, filter, preview, batch-select, download, and delete saved recordings.
- **Native Electron Desktop Integration**:
  - Secure IPC with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
  - Native filesystem storage (`~/Videos/CameraRecorder`) with directory picker and "Show in Folder" file manager integration.
  - Native desktop notifications for recording lifecycle events.
  - Full Ubuntu native Application Menu (File, View, Help) with global keyboard shortcuts.
- **Dual-Mode Architecture**: Runs as a standard browser web app as well as a native Electron Ubuntu desktop application without code duplication.

---

## Architecture

```text
camera-recorder/
├── electron/
│   ├── main.ts                     # Electron main process & window lifecycle
│   ├── preload.ts                  # Secure contextBridge exposing window.electronAPI
│   ├── ipc/                        # Modular IPC request/response handlers
│   │   ├── recording.ts            # Native recording status & control
│   │   ├── filesystem.ts           # Desktop storage & file operations
│   │   ├── devices.ts              # Device enumeration bridge
│   │   └── system.ts               # Notifications & system info
│   ├── services/
│   │   ├── recordingService.ts     # Session state & duration management
│   │   ├── filesystemService.ts    # Filesystem I/O, directory scanning & opening
│   │   ├── systemService.ts        # Desktop notifications & OS info
│   │   └── media/
│   │       ├── ffmpegService.ts    # Future-ready FFmpeg transcoding bridge
│   │       └── recordingPipeline.ts# PipeWire / GStreamer pipeline abstraction
│   └── utils/
│       ├── logger.ts               # Structured development logger
│       └── paths.ts                # Ubuntu path resolver & preferences
│
├── src/
│   ├── components/                 # UI components (camera, audio, recordings, layout)
│   ├── pages/                      # Dashboard, Camera, Audio, Recorder, Recordings, Settings
│   ├── hooks/                      # useCamera, useAudio, useMediaRecorder, useMediaDevices
│   ├── services/
│   │   ├── platform/
│   │   │   └── platformBridge.ts   # Unified browser/electron platform abstraction
│   │   ├── media/                  # WebRTC & MediaRecorder capture services
│   │   └── storage/                # IndexedDB client-side database
│   ├── stores/                     # Zustand stores (appStore, recorderStore)
│   ├── types/
│   │   ├── electron.d.ts           # window.electronAPI TypeScript declarations
│   │   ├── recording.ts            # Media item & codec types
│   │   └── camera.ts               # Resolution & FPS configuration
│   └── utils/
│       ├── environment.ts          # isElectron() runtime detector
│       ├── mediaUtils.ts           # Codec detection & file helpers
│       └── formatters.ts           # Date, time, and file size formatters
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Development & Build Commands

### 1. Browser Development (Vite)
Runs the standalone web application with HMR / fast dev server:
```bash
npm run dev
```

### 2. Electron Desktop Development
Compiles Electron TypeScript files and launches the Ubuntu desktop window:
```bash
npm run electron:dev
```

### 3. Production Build
Builds the Vite static web assets (`dist/`) and bundles the Electron main & preload scripts (`dist-electron/`):
```bash
npm run build
```

### 4. Electron Desktop Production Preview
Runs the compiled production desktop application:
```bash
npm run electron:preview
```

### 5. Linux Packaging (AppImage & .deb)
Packages the application into Linux binaries using `electron-builder`:
```bash
# Package for all configured Linux targets (AppImage and deb)
npm run package:linux

# Package as AppImage only
npm run package:appimage

# Package as Debian package (.deb) only
npm run package:deb
```

---

## Ubuntu System Dependencies

For packaging and native media processing on Ubuntu Linux:
```bash
# General build tools
sudo apt update
sudo apt install -y build-essential libssl-dev

# Optional FFmpeg tools for advanced transcoding
sudo apt install -y ffmpeg
```

---

## Security Model

The Electron configuration implements strict security best practices:
- **`contextIsolation: true`**: Prevents the renderer from accessing Node.js internals or the Electron main process prototype chain.
- **`nodeIntegration: false`**: Disables Node.js in the renderer window.
- **`sandbox: true`**: Enables Chromium sandbox isolation for renderer processes.
- **Strict Preload API**: Only explicitly required functions are exposed via `window.electronAPI`.
