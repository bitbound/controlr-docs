---
sidebar_position: 3
title: Remote Control
---

## Overview

Remote Control lets you stream and control the screen of any connected device in real time. It uses WebSocket-based screen capture and input forwarding for low-latency remote access.

## Accessing Remote Control

1. Navigate to a device's page
2. Click **Remote Control** in the device access menu (or go to `/device-access/remote-control?deviceId={id}`)

## Session Select (Windows)

On Windows devices, multiple desktop sessions may be available. The session select screen shows:

| Column | Description |
|--------|-------------|
| **Session ID** | Unique session identifier |
| **PID** | Process ID of the desktop session |
| **Name** | Session name (e.g., "Console", "RDP-Tcp#0") |
| **Username** | User who owns the session |
| **Platform** | Platform type |
| **Permissions** | Available permissions (view, input) |

Select a session to connect, or choose **Preview** to see a thumbnail before connecting.

## Controls

### Desktop

| Control | Action |
|---------|--------|
| **Zoom In** | Ctrl + Shift + Mouse Wheel |
| **Zoom Out** | Ctrl + Shift + Mouse Wheel |
| **Full Screen** | Click the full-screen button |
| **Disconnect** | Click the disconnect button |

### Mobile / Touch Devices

| Control | Action |
|---------|--------|
| **Zoom In** | Pinch gesture |
| **Zoom Out** | Pinch gesture |
| **Right-Click** | Tap and hold |
| **Click-and-Drag** | Tap and hold, then drag |

## Settings

Remote control settings are configured in **Settings** (`/settings`):

### View Mode

| Mode | Description |
|------|-------------|
| **Fit** | Scale to fit the browser window, maintaining aspect ratio |
| **Stretch** | Scale to fill the browser window (may distort aspect ratio) |
| **Scale** | Fixed scale percentage |

### Quality Settings

| Setting | Description |
|---------|-------------|
| **Auto Quality** | Automatically adjusts quality based on network conditions |
| **Manual Quality** | Fixed quality level |
| **Max Bandwidth** | Cap for maximum bandwidth usage |

### Capture Settings

| Setting | Description |
|---------|-------------|
| **Show Cursor** | Display the remote cursor in the stream |
| **DirectX Capture** | Use DirectX for screen capture (Windows, better performance) |

## Connection States

| State | Description |
|-------|-------------|
| **Connecting** | Establishing the WebSocket connection |
| **Active** | Remote control session is active |
| **Loading** | Loading the session |
| **Reconnecting** | Attempting to reconnect after a disruption |
| **Alert** | An error or warning has occurred |
| **Session Select** | Waiting for the user to select a session |
| **Unsupported OS** | The remote OS is not supported for remote control |

## VNC Relay (Experimental)

For Mac and Linux devices, ControlR supports experimental VNC relay:

1. Navigate to **VNC Relay** in the device access menu
2. Specify the VNC server port on the remote device
3. Click **Test** to verify the connection
4. Click **Connect** to start the session

The VNC connection is streamed through a noVNC iframe via WebSockets, so the VNC server can bind to localhost for security.

## Server Notifications

When a remote session starts, the remote user can be notified. This behavior is controlled by the tenant setting `notify-user-on-session-start` (configurable at `/tenant-settings`) or the user's individual notification preference.

## Next

- **[Device Management](/docs/features/device-management)** — Monitor and organize devices
- **[File System](/docs/user-guide/file-system)** — Remote file management
- **[Terminal](/docs/user-guide/terminal)** — Remote terminal access
