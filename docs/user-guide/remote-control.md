---
sidebar_position: 1
title: Remote Control
---

## Overview

Remote Control lets you stream and control the screen of any connected device in real time. It uses WebSocket-based screen capture and input forwarding for low-latency remote access.

## Accessing Remote Control

1. Navigate to a device's page (click the device card from the Dashboard)
2. Click **Remote Control** in the device access menu
3. Or go directly to `/device-access/remote-control?deviceId={id}`

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
| **Auto Quality** | Automatically adjusts quality based on network conditions (default) |
| **Manual Quality** | Fixed quality level with configurable threshold |
| **Max Bandwidth** | Cap for maximum bandwidth usage |

### Capture Settings

| Setting | Description |
|---------|-------------|
| **Show Cursor** | Display the remote cursor in the stream |
| **DirectX Capture** | Use DirectX for screen capture (Windows only, better performance) |

## Connection States

| State | Description |
|-------|-------------|
| **Connecting** | Establishing the WebSocket connection |
| **Active** | Remote control session is active and streaming |
| **Loading** | Loading the session resources |
| **Reconnecting** | Attempting to reconnect after a network disruption |
| **Alert** | An error or warning has occurred |
| **Session Select** | Waiting for the user to select a desktop session |
| **Unsupported OS** | The remote OS is not supported for native remote control |

## Keyboard Input Modes

Keyboard input can be configured in Settings:

| Mode | Description |
|------|-------------|
| **Auto** | Automatically detects the correct input mode |
| **Physical** | Sends physical key events |
| **Virtual** | Sends virtual key events (better compatibility with some applications) |

## Server Notifications

When a remote session starts, the remote user can be notified. This behavior is controlled by the tenant setting `notify-user-on-session-start` (configurable at `/tenant-settings`) or the user's individual notification preference.

## Invoke Ctrl+Alt+Del (Windows)

On Windows devices, you can invoke Ctrl+Alt+Del through the remote control interface. This is useful for unlocking locked sessions or accessing the security screen.

## Next

- **[Dashboard](/docs/user-guide/dashboard)** — Overview of all devices
- **[File System](/docs/user-guide/file-system)** — Remote file management
- **[Terminal](/docs/user-guide/terminal)** — Remote PowerShell access
