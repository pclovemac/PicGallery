# PicGallery 🖼️

[中文](./README.md) | [English](./README_en.md)

PicGallery is an **advanced local network / NAS multimedia gallery management system designed for families and geeks**. Featuring a sleek modern Glassmorphism UI and a highly optimized engine, PicGallery displays oceans of photos and video memories stored on your servers or NAS with incredible loading efficiency.

The system natively integrates real-time UI language switching (i18n) and hot-reloading background permission controls. It aims to satisfy your powerful data-management desires while providing a perfectly intuitive and immersive masonry browsing experience for the elders and loved ones.

---

## ✨ Core Features

- **Extreme Masonry Layout & Deep DFS Traversal**: Automatically penetrates deep file structures to scan and map nested folders (DFS recursion). All images hidden across different subdirectories are effortlessly retrieved and seamlessly tiled in a unified masonry gallery.
- **Cross-Format & Dual Engine**: Supports widespread image matrices and introduces seamless integration for parsing mainstream video formats, including automated video cover frame extraction (powered gracefully by `ffmpeg`).
- **Complete Internationalization (i18n)**: Features an extremely fast, zero-dependency contextual dictionary engine. Users can instantly switch the entire system UI between English and Chinese with a single click.
- **Hot-Reloading Admin Panel**: Major architectural configurations (e.g. redirecting exact paths of your NAS photo sources, migrating admin credentials, etc.) can be adjusted through an online Admin interface, instantly taking effect without the annoying need to restart the backend application.
- **Media Invisibility Cloak**: Implement a blocking layer targeting any sensitive or private photos/videos with a single switch. Regular visitors will be physically isolated from blocked contents, ensuring you display only the curated memories you desire.
- **Micro-Millisecond Image Processing**: Employs an abrasive graphic engine (`sharp`) in the backend to swiftly crop and cache lightweight WebP thumbnails on the fly, preventing bandwidth bottlenecks and browser freezes when rendering tens of thousands of full-frame original snaps.
- **Time-Series Radar**: Supports real-time "Photos Only" / "Videos Only" filtering, alongside an **Automated Yearbook Slicing Toolbar** generated strictly based on actual media modified timestamps (`mtime`).

---

## 🛠️ Server Requirements

To guarantee high-speed rendering and absolute resilience when dealing with massive multimedia troves, PicGallery is built upon a scalable dual Node.js architecture. You can directly host it natively on Linux (highly recommended; Ubuntu/Debian), Windows, or macOS.

### Prerequisites:
- **Node.js**: v18 or newer
- **A Multimedia Source**: Can be a local drive folder physically on the server, or a remote NAS/SMB network shared drive freshly mounted.

### Video Frame Extraction Requirements (Optional):
Please ensure that your system has the underlying `ffmpeg` package installed for video rendering capabilities:
- Ubuntu: `sudo apt install ffmpeg`
- CentOS: `sudo yum install ffmpeg`

---

## 🚀 Deployment Guide

### 1. Clone & Retrieve
Transport this repository into your chosen hosting terminal:
```bash
git clone <repository-url> PicGallery
cd PicGallery
```

### 2. Dual-Tier Build Process
The system is bifurcated into a Backend serving engine and a Frontend rendering cluster.

**A. Compile the Frontend Engine:**
```bash
cd frontend
npm install
npm run build
```
*(This gracefully packages the entire React application into the `dist` folder, which the backend will dynamically mount and host).*

**B. Ignite the Backend Serving Engine:**
```bash
cd ../backend
npm install
```

### 3. Quick Ignition
Once everything is settled, fire up the system while remaining in the `backend` folder:
```bash
node server.js
```
*(Tip: In a production server setting, we strongly recommend deploying PM2 for a permanent daemon experience and automatic reboots: `pm2 start server.js --name picgallery`)*

### 4. Initialization & Setup
1. Visit `http://<your-server-ip>:3000` via any browser in your Local Network.
2. Click the **"🔒 Mgmt Mode"** button at the top-right corner.
3. Default Login Credentials:
   - Username: `admin`
   - Password: `admin123`
4. After successfully authenticating, PLEASE immediately hit the **Settings** gear to swap your startup credentials, and firmly point the **"NAS Mounting Path (Absolute Route)"** parameter to your actual photo gallery root pathway!

*(Note: The system triggers an immediate stealth generation of ultra-fast cache thumbnails upon reading new directories. If you witness blank placeholders, please allow it a moment or two to breeze through its indexing phase!)*

---

## 📁 Architectural Blueprint

```text
PicGallery/
├── backend/                  # —— Deep Engine Ecosystem
│   ├── config.js             # Infrastructure Fallback Constants
│   ├── routes/               # API Gateways (Settings / Auth / Media Hooks)
│   ├── services/             # Background Orchestration Layers
│   │   ├── settingsService.js  # Dedicated Configuration Dispatcher
│   │   └── thumbnailService.js # High-speed Frame Puncher & Mapper
│   ├── data/                 # —— Generating Pod
│   │   ├── .thumbnails/      # Derivative Buffer Zone (Do Not Manually Clean)
│   │   └── settings.json     # Global Override & Core Database File
│   └── server.js             # 🚀 Primary Rocket Engine
│
└── frontend/                 # —— User Interface Ecosystem
    ├── src/
    │   ├── context/          # Contextual Wrappers (i18n & Auth Propagators)
    │   ├── components/       # Assembled Component Blocks
    │   ├── App.jsx           # Main Structural Frame
    │   └── index.css         # Visual Core & Aesthetic Definitions
    └── package.json          # Vite Operations Manifest
```

---

## 🪧 Maintenance Memoirs

- **Privacy Barriers:** Unauthenticated end-users are physically bounded to the public visibility network. Masked or blocked content translates to zero existence during regular scans, as all APIs forcefully sanitize blocked requests lacking an Admin Signature payload.
- **Hyper-Fast Reloads:** When throwing additional content onto the NAS via SMB/FTP bypassing the platform, you don't need server restarts. The application naturally recognizes uncached gaps whenever fetching, rebuilding them instantly.
- **Isolated Upload Safety:** Files forcefully pushed via the Web upload UI will default to resting safely at the foundational **origin root directory** instead of traversing inside scattered sub-folders. This ensures PicGallery will never organically sabotage your meticulously structured NAS directory layouts.
