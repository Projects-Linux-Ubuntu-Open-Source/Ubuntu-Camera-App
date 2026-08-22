<div align="center">

# 📷 🎙️ Ubuntu Camera & Audio Recorder

[![Ubuntu](https://img.shields.io/badge/Platform-Ubuntu%20Linux%2022.04%20%7C%2024.04-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)](https://ubuntu.com)
[![Electron](https://img.shields.io/badge/Electron-30.0-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](package.json)
[![Security: Context Isolated](https://img.shields.io/badge/Security-Context_Isolated_%26_Sandboxed-blueviolet?style=for-the-badge)](electron/preload.ts)

<p align="center">
  <b>A desktop-grade media capture, audio metering, and camera recording suite designed for Ubuntu Linux.</b>
  <br />
  Combines real-time WebRTC streams, V4L2 device routing, PipeWire/PulseAudio integration, audio spectrum visualization, and native filesystem persistence into a unified, secure Electron desktop application.
</p>

[Key Features](#-key-features) • [Architecture](#-architecture--design) • [Quick Start](#-quick-start) • [Packaging](#-packaging--distribution) • [IPC API Reference](#-ipc-api-reference) • [Ubuntu Configuration](#-ubuntu-system-integration) • [Troubleshooting](#-troubleshooting--faq)

---

</div>

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Camera Studio & Snapshot Engine](#1-camera-studio--snapshot-engine)
  - [2. High-Precision Audio Spectrum Studio](#2-high-precision-audio-spectrum-studio)
  - [3. Dual Studio Video + Audio Recorder](#3-dual-studio-video--audio-recorder)
  - [4. Recordings Library & Media Inspector](#4-recordings-library--media-inspector)
  - [5. Native Ubuntu Desktop Integration](#5-native-ubuntu-desktop-integration)
- [Architecture & Design](#-architecture--design)
  - [Dual-Runtime Platform Abstraction (`PlatformBridge`)](#dual-runtime-platform-abstraction-platformbridge)
  - [Electron Security Model](#electron-security-model)
  - [Directory Tree](#directory-tree)
- [Quick Start & Development](#-quick-start--development)
  - [System Requirements](#system-requirements)
  - [Installation](#installation)
  - [Development Modes](#development-modes)
- [Packaging & Distribution](#-packaging--distribution)
  - [AppImage (`.AppImage`)](#appimage-appimage)
  - [Debian Package (`.deb`)](#debian-package-deb)
  - [Desktop Launcher Integration (`.desktop`)](#desktop-launcher-integration-desktop)
- [IPC API Reference](#-ipc-api-reference)
- [Ubuntu System Integration](#-ubuntu-system-integration)
  - [Video4Linux2 (V4L2) Permissions](#video4linux2-v4l2-permissions)
  - [PipeWire & PulseAudio Configuration](#pipewire--pulseaudio-configuration)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [License](#-license)

---

## 🌟 Overview

**Ubuntu Camera & Audio Recorder** is engineered from the ground up to solve the fragmented webcam and microphone capture experience on Linux desktops. Built with an Ubuntu Yaru-inspired aesthetic and strict adherence to modern security practices, it functions identically as:

1. **A Native Ubuntu Desktop Application**: Powered by Electron with direct filesystem I/O (`~/Videos/CameraRecorder`), system notifications via `libnotify`, native application menus, and hardware-accelerated rendering.
2. **A Zero-Install Web Application**: Running in modern web browsers with IndexedDB local persistence, responsive layout, and full client-side WebRTC capabilities.

---

## 🚀 Key Features

### 1. Camera Studio & Snapshot Engine
- **V4L2 / UVC Camera Stream Selection**: Dynamically enumerates and switches between internal webcams, USB capture cards, and virtual video loopbacks without stream drops.
- **Resolution & Frame Rate Control**: Presets for Full HD (1080p @ 60/30 FPS), HD (720p @ 60/30 FPS), Standard Definition (480p), and custom aspect ratios.
- **Rule of Thirds Overlay**: Dynamic 3x3 framing grid to assist in eye-level composition and lighting balance.
- **Instant Photo Snapshots**: Zero-latency full-resolution canvas rasterization with PNG / JPEG export, flash feedback animation, and thumbnail previews.
- **Horizontal Mirroring**: Flip stream for natural user orientation during presentations or screencasts.

### 2. High-Precision Audio Spectrum Studio
- **Web Audio API Real-Time Fast Fourier Transform (FFT)**: 64-band visual equalizer with smoothed decay dynamics.
- **Real-Time VU Decibel Metering**: Peak hold meter calibrated in decibels (dBFS) with color-coded safety, warning, and clip indicators (`green` -> `amber` -> `red`).
- **Input Gain & DSP Controls**: Live volume amplification slider, hardware Echo Cancellation toggle, Noise Suppression, and Auto Gain Control.
- **Voice Memo Recorder**: Dedicated WAV / WebM audio capture pipeline with live waveform visualizer and elapsed time tracking.

### 3. Dual Studio Video + Audio Recorder
- **Multiplexed Media Capture**: Synchronous WebM / VP8 / VP9 / AVC1 video and Opus audio encoding via standard `MediaRecorder`.
- **Live State Machine**: Non-blocking `idle` -> `recording` -> `paused` -> `stopped` state flow with instant recovery.
- **Real-Time Bitrate & Size Estimator**: Dynamically computes projected file size, elapsed recording duration, and live buffer health.
- **Auto-Naming Conventions**: Generates clean, timestamped filenames (e.g. `recording_2026-08-21_21-39-02.webm`).

### 4. Recordings Library & Media Inspector
- **Instant Playback & Scrubbing**: Built-in modal media player with seekbar, volume control, and looping.
- **Desktop Folder Explorer**: Single-click "Show in Folder" action triggering the default Ubuntu file manager (`Nautilus` / `xdg-open`).
- **Batch Management**: Multi-select deletion, batch ZIP download, and search filter by name, date, or media type (`video`, `audio`, `photo`).
- **Metadata Inspection**: View exact duration, mime type, file size, codec parameters, and absolute filesystem path.

### 5. Native Ubuntu Desktop Integration
- **Default Storage Path**: Automatically creates and maintains `~/Videos/CameraRecorder` or respects user-selected directories.
- **Native OS Notifications**: Alerts on recording completion, snapshot saved, and disk space warnings using desktop notification daemons.
- **Ubuntu Shell Shortcuts**: Standard menu accelerators (`Ctrl+N`, `Ctrl+Shift+C`, `Ctrl+Shift+A`, `Ctrl+,`) linked to reactive in-app views.
- **Zero Background Persistence**: Automatically halts all recording sessions and cleanly terminates the entire Node.js and Chromium process tree upon window close or quit (`window-all-closed`, `SIGINT`, `SIGTERM`), preventing zombie processes.

---

## 🏛️ Architecture & Design

### Dual-Runtime Platform Abstraction (`PlatformBridge`)

The application decouples platform-specific capabilities behind a unified, TypeScript-enforced interface. All UI pages and hooks interact exclusively with `PlatformBridge`:

```
┌─────────────────────────────────────────────────────────────┐
│                    React UI Layer (Views)                   │
│        (Camera.tsx / Audio.tsx / Recorder.tsx / Library)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │       PlatformBridge        │
                │ (src/services/platform/)    │
                └──────┬───────────────┬──────┘
                       │               │
       [isElectron() == true]    [isElectron() == false]
                       │               │
        ┌──────────────▼──────┐ ┌──────▼──────────────┐
        │  window.electronAPI │ │ IndexedDB Storage   │
        │  (Secure IPC Proxy) │ │ (recordingStorage)  │
        └──────────────┬──────┘ └─────────────────────┘
                       │
       ┌───────────────▼──────────────┐
       │   Electron Main Process      │
       │  (Filesystem / OS Dialogs /  │
       │   libnotify / App Lifecycle) │
       └──────────────────────────────┘
```

### Electron Security Model

To protect user privacy and system security, the Electron architecture adheres to Chromium and Electron security best practices:

| Parameter | Configuration | Purpose |
|:---|:---|:---|
| **`contextIsolation`** | `true` | Separates the JavaScript execution context of the preload script from the website script. |
| **`nodeIntegration`** | `false` | Disables Node.js primitives in the renderer process to prevent remote code execution (RCE). |
| **`sandbox`** | `true` | Restricts renderer execution inside the OS-level Chromium security sandbox. |
| **`webSecurity`** | `true` | Enforces Same-Origin Policy and restricts local filesystem URI access. |
| **Channel Whitelist** | Enforced in `preload.ts` | Exposes only explicit, strongly typed methods without broad `ipcRenderer.send()` access. |

### Directory Tree

```text
├── assets/                           # 🎨 Application Assets & Icons
│   └── Icon.png                      # High-resolution desktop application icon
│
├── electron/                         # 🖥️ Native Electron Main Process
│   ├── main.ts                       # Main process entry & window manager
│   ├── preload.ts                    # ContextBridge security barrier & API exposure
│   ├── ipc/                          # Modular IPC Request Handlers
│   │   ├── devices.ts                # Hardware device enumeration IPC
│   │   ├── filesystem.ts             # Storage location & file manager IPC
│   │   ├── recording.ts              # Recording session management IPC
│   │   └── system.ts                 # Notifications & OS version IPC
│   ├── services/                     # Main Process Business Logic
│   │   ├── filesystemService.ts      # Native filesystem I/O (fs/promises)
│   │   ├── recordingService.ts       # Active session timer & metadata tracker
│   │   ├── systemService.ts          # System notifications & platform details
│   │   └── media/                    # Native media pipelines
│   │       ├── ffmpegService.ts      # Transcoding & format conversion bridge
│   │       └── recordingPipeline.ts  # PipeWire / GStreamer integration stub
│   └── utils/
│       ├── logger.ts                 # Colored terminal logger
│       └── paths.ts                  # XDG directory resolver & path sanitization
│
├── src/                              # 🌐 React 19 Frontend (Renderer)
│   ├── components/                   # Modular UI Components
│   │   ├── audio/                    # Equalizer, VU meter, audio controls
│   │   ├── camera/                   # Camera canvas, stream view, resolution selector
│   │   ├── devices/                  # Device selector dropdowns & permission banners
│   │   ├── layout/                   # WindowFrame, Ubuntu-styled Sidebar, Navigation
│   │   ├── recordings/               # Recording cards, media player modal, batch actions
│   │   └── ui/                       # Buttons, Cards, Modals, Badges, Toast alerts
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAudio.ts               # Web Audio API context, analyser & gain node
│   │   ├── useCamera.ts              # MediaStream video constraints & snapshot engine
│   │   ├── useMediaDevices.ts        # navigator.mediaDevices device list & permissions
│   │   └── useMediaRecorder.ts       # MediaRecorder orchestration & chunk handling
│   ├── pages/                        # View Controllers
│   │   ├── Dashboard.ts              # Overview, quick recording triggers, metrics
│   │   ├── Camera.tsx                # Video live preview & still photo booth
│   │   ├── Audio.tsx                 # Real-time spectrum analyzer & audio recorder
│   │   ├── Recorder.tsx              # Synchronized multi-source studio recorder
│   │   ├── Recordings.tsx            # Media gallery, sorting, and inspector
│   │   └── Settings.tsx              # Storage directory picker & hardware configuration
│   ├── services/                     # Frontend Services
│   │   ├── media/                    # Browser WebRTC recording service
│   │   ├── platform/                 # PlatformBridge routing (Desktop vs Web)
│   │   └── storage/                  # Client-side IndexedDB persistence
│   ├── stores/                       # Global State Management (Zustand)
│   │   ├── appStore.ts               # Navigation state, notifications, theme
│   │   └── recorderStore.ts          # Active recording stream, duration, status
│   ├── types/                        # TypeScript Interfaces
│   │   ├── electron.d.ts             # Typed window.electronAPI declarations
│   │   ├── camera.ts                 # Video resolution & FPS definitions
│   │   └── recording.ts              # Recording item metadata & mime type schemas
│   └── utils/                        # Pure Utilities
│       ├── environment.ts            # Runtime environment detector (isElectron)
│       ├── formatters.ts             # Human-readable durations, dates, and bytes
│       └── mediaUtils.ts             # Codec compatibility checks & Blob conversions
│
├── package.json                      # Build scripts, dependencies & electron-builder config
├── vite.config.ts                    # Vite build pipeline & Tailwind CSS plugin
├── tsconfig.json                     # TypeScript strict mode configuration
└── README.md                         # Project documentation
```

---

## ⚡ Quick Start & Development

### System Requirements

- **Operating System**: Ubuntu Linux 22.04 LTS (Jammy Jellyfish), 24.04 LTS (Noble Numbat), or any modern Linux distribution with X11 / Wayland.
- **Node.js**: `v18.0.0` or higher (`v20+` LTS recommended).
- **npm**: `v9.0.0` or higher.
- **Hardware**: Standard UVC-compliant USB Webcam or integrated laptop camera; ALSA / PulseAudio / PipeWire compatible microphone.

### Installation

Clone the repository and install dependencies:

```bash
# Clone repository
git clone https://github.com/your-username/camera-recorder.git
cd camera-recorder

# Install node dependencies
npm install
```

### Development Modes

#### 1. Browser Web Mode (Vite Dev Server)
Spins up a lightweight local server on port 3000 with Hot Module Replacement:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. All recordings will be stored securely in browser IndexedDB.

#### 2. Electron Desktop Dev Mode
Compiles the Electron TypeScript main & preload bundles and launches the native Ubuntu desktop window:
```bash
npm run electron:dev
```

#### 3. Type Checking & Linting
Runs strict TypeScript validation across both renderer and main process codebases:
```bash
npm run lint
```

---

## 📦 Packaging & Distribution

The project includes pre-configured `electron-builder` targets optimized for Ubuntu and Debian-based Linux environments.

```bash
# Full build of renderer and electron main processes
npm run build
```

### AppImage (`.AppImage`)
Generates a standalone, dependency-free binary that runs across all Linux distributions without installation:
```bash
npm run package:appimage
```
*Output will be generated in `/release/Camera Recorder-1.0.0.AppImage`.*

To run the generated AppImage:
```bash
chmod +x "release/Camera Recorder-1.0.0.AppImage"
./"release/Camera Recorder-1.0.0.AppImage"
```

### Debian Package (`.deb`)
Creates a native `.deb` package integrated with the `dpkg` and `apt` package managers:
```bash
npm run package:deb
```
*Output will be generated in `/release/camera-recorder_1.0.0_amd64.deb`.*

Install with `dpkg`:
```bash
sudo dpkg -i "release/camera-recorder_1.0.0_amd64.deb"
sudo apt-get install -f # Fix any missing system dependencies
```

### Desktop Launcher Integration (`.desktop`)

When installed via `.deb`, the application registers the following desktop launcher entry at `/usr/share/applications/camera-recorder.desktop`:

```ini
[Desktop Entry]
Name=Camera Recorder
Comment=Desktop-grade camera and audio recording studio for Ubuntu Linux
Exec=camera-recorder %U
Icon=camera-recorder
Terminal=false
Type=Application
Categories=AudioVideo;Recorder;Audio;Video;
StartupWMClass=camera-recorder
```

---

## 🔌 IPC API Reference

The Electron preload script exposes the `window.electronAPI` bridge to the renderer process. All methods are asynchronous and return typed Promises.

| Method | Parameters | Return Type | Description |
|:---|:---|:---|:---|
| `saveRecording` | `data: NativeRecordingPayload` | `Promise<NativeRecordingResponse>` | Persists a recorded video/audio/photo buffer directly to the filesystem. |
| `getRecordings` | *None* | `Promise<RecordingItem[]>` | Scans the recordings directory and returns parsed media metadata. |
| `deleteRecording` | `id: string, filePath?: string` | `Promise<boolean>` | Removes a media file and its thumbnail from the local disk. |
| `getStorageLocation` | *None* | `Promise<string>` | Retrieves the current active destination directory path. |
| `chooseStorageDirectory` | *None* | `Promise<string \| null>` | Spawns a native Ubuntu GTK folder picker dialog. |
| `showInFolder` | `filePath: string` | `Promise<void>` | Opens the OS file manager (`Nautilus`) and highlights the target file. |
| `notify` | `payload: NotificationPayload` | `Promise<void>` | Triggers a desktop notification via Linux `libnotify`. |
| `getSystemInfo` | *None* | `Promise<SystemInfo>` | Returns CPU architecture, platform, OS release, and memory stats. |
| `onMenuAction` | `callback: (action: string) => void` | `() => void` (Unsubscribe) | Subscribes to global application menu events and shortcuts. |

---

## 🐧 Ubuntu System Integration

### Video4Linux2 (V4L2) Permissions

If your user account does not have access to `/dev/video*` devices, add your user to the `video` group:

```bash
# Add current user to video group
sudo usermod -a -G video $USER

# Apply group changes immediately (or log out and log back in)
newgrp video
```

Verify camera detection using `v4l2-ctl`:
```bash
sudo apt install -y v4l-utils
v4l2-ctl --list-devices
```

### PipeWire & PulseAudio Configuration

On modern Ubuntu 22.04+ systems running PipeWire:
```bash
# Verify PipeWire audio server status
systemctl --user status pipewire.service

# Check connected audio capture nodes
pw-cli list-objects Node
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|:---|:---|:---|
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | New Recording | Switches to the Studio Recorder view |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> | Open Camera | Switches to the Live Camera view |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> | Open Audio Studio | Switches to the Audio Equalizer & Metering view |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> | Library | Opens the Recordings Library |
| <kbd>Ctrl</kbd> + <kbd>,</kbd> | Preferences | Opens Settings & Storage Configuration |
| <kbd>Ctrl</kbd> + <kbd>Q</kbd> | Quit Application | Gracefully closes the Electron desktop application |

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><b>1. Camera shows a black screen or permission denied error</b></summary>

- Ensure another application (like Cheese, OBS Studio, or a web browser) is not holding an exclusive lock on the camera device.
- Verify user permissions in the `video` user group: `groups $USER | grep video`.
- On Wayland sessions, ensure camera access is allowed in **Ubuntu Settings -> Privacy -> Camera**.
</details>

<details>
<summary><b>2. Audio VU meter shows 0 dB or no response</b></summary>

- Open **Ubuntu Settings -> Sound -> Input** and ensure the correct microphone is selected as the default input device.
- In the app, switch to the **Audio Studio** tab and verify the selected input source from the device dropdown.
- Check input gain slider inside the app to ensure it is not muted.
</details>

<details>
<summary><b>3. Where are my recordings saved in desktop mode?</b></summary>

- By default, recordings are saved to `~/Videos/CameraRecorder`.
- You can change this directory at any time in **Settings -> Storage & Desktop Runtime -> Change Folder...**.
- In browser mode, recordings are saved locally inside IndexedDB and can be downloaded as standard files.
</details>

<details>
<summary><b>4. AppImage does not start on Ubuntu 24.04</b></summary>

- Ubuntu 24.04 enables unprivileged user namespace restrictions by default. Run with:
  ```bash
  ./"Camera Recorder-1.0.0.AppImage" --no-sandbox
  ```
  Or install `libfuse2`:
  ```bash
  sudo apt install -y libfuse2
  ```
</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```text
Copyright (c) 2026 Ubuntu Camera Recorder Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">
  <sub>Built with ❤️ for the Ubuntu Linux community. Powered by React, Vite, Tailwind CSS, and Electron.</sub>
</div>
