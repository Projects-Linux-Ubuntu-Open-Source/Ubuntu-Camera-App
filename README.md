# Ubuntu Camera & Audio Recorder

> **Phase 1: React & TypeScript Frontend Foundation**  
> A desktop-style Camera and Audio Recording studio application designed for Ubuntu / Linux desktop environments with a clean, hardware-integrated React architecture.

---

## 🎯 Project Overview

**Ubuntu Camera & Audio Recorder** provides a native-feel desktop recording suite directly inside the browser. It allows users to monitor live camera feeds, capture high-resolution still photographs, analyze acoustic microphone signals with real-time VU and frequency spectrum visualizers, record synchronized audio/video sessions, and manage a persistent library of media captures.

This codebase serves as **Phase 1: Pure Frontend & Services Architecture**, intentionally decoupled from native runtimes so it runs seamlessly in standard modern browsers while providing clean service abstractions (`CameraService`, `AudioService`, `RecordingService`, `RecordingStorage`) ready to connect to **Electron / PipeWire / FFmpeg** in Phase 2.

---

## 🛠️ Technology Stack

- **Framework**: React 19 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (with Ubuntu dark theme aesthetics `#0b0d10` & `#11151a` panels)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Media APIs**:
  - `navigator.mediaDevices.getUserMedia()`
  - `navigator.mediaDevices.enumerateDevices()`
  - `MediaRecorder` API
  - `Web Audio API` (`AudioContext`, `AnalyserNode` for dB & frequency spectrum)
- **Local Persistence**: IndexedDB (via `RecordingStorage` abstraction)

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will be served at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📂 Project Architecture

```text
src/
├── components/
│   ├── layout/          # WindowFrame, Sidebar, Titlebar
│   ├── camera/          # CameraPreview, CameraControls, SnapshotModal
│   ├── audio/           # AudioVisualizer (Canvas VU meter & spectrum), Controls
│   ├── recorder/        # Combined Studio Viewfinder & RecordingIndicator
│   ├── recordings/      # RecordingCard, MediaViewerModal
│   ├── devices/         # DeviceSelector, PermissionBanner
│   └── ui/              # Button, Card, Badge, Select, Modal, Toast
│
├── hooks/
│   ├── useCamera.ts         # Viewfinder lifecycle, snapshot, telemetry
│   ├── useAudio.ts          # Microphone streaming & real-time audio analysis loop
│   ├── useMediaDevices.ts   # Device detection & 'devicechange' listener
│   └── useMediaRecorder.ts  # MediaRecorder orchestration & duration timer
│
├── services/
│   ├── media/
│   │   ├── cameraService.ts     # CameraService interface & Browser implementation
│   │   ├── audioService.ts      # AudioService interface & Web Audio API implementation
│   │   └── recordingService.ts  # RecordingService interface & MediaRecorder implementation
│   └── storage/
│       └── recordingStorage.ts  # RecordingStorage interface & IndexedDB implementation
│
├── stores/
│   ├── appStore.ts          # Page routing, toasts, app settings
│   ├── cameraStore.ts       # Camera resolution, fps, mirror, state
│   └── recorderStore.ts     # Global recordings list, duration, storage usage
│
├── types/                   # Strongly-typed interfaces for devices, media, recordings
└── utils/                   # Formatters, MIME detection, download utilities
```

---

## 🔒 Browser Permissions & Fallbacks

- **Camera & Microphone Access**: The application queries hardware permissions using standard Web APIs. If permissions are dismissed or blocked, a dismissible hardware assistance banner guides the user to grant access in their browser address bar without crashing the UI.
- **Device Hotplugging**: Automatically listens to the `devicechange` hardware event, dynamically updating device dropdowns when webcams or USB microphones are plugged in or disconnected.

---

## ⚠️ Phase 1 Limitations

- **Browser Sandboxing**: Media recordings are saved inside browser IndexedDB storage rather than writing directly to `/home/user/Videos` or custom filesystem paths. Files can be individually downloaded or exported in standard formats (`.webm`, `.png`, `.mp4`).
- **Codec Constraints**: Available recording codecs (VP9, VP8, H.264, Opus, AAC) depend on browser engine support.

---

## 🔮 Phase 2: Planned Electron Architecture

In Phase 2, this frontend will integrate with Electron without requiring changes to the React components. The service interfaces (`CameraService`, `AudioService`, `RecordingStorage`) will be backed by Electron IPC channels:

```text
React UI Components
        ↓
Application Services Layer (CameraService / RecordingStorage)
        ↓
Electron IPC Bridge (preload.ts / contextBridge)
        ↓
Node.js Main Process & Native Linux APIs (PipeWire / ALSA / V4L2 / FFmpeg)
        ↓
Ubuntu Filesystem Storage (~/Videos/Recordings, ~/Pictures/Captures)
```

---

## 📄 License

Apache-2.0
