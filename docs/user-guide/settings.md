---
sidebar_position: 9
title: Settings
---

## Overview

The Settings page (`/settings`) contains per-user preferences for the ControlR web interface. These settings customize your remote control experience.

## Display Preferences

### Theme

| Option | Description |
|--------|-------------|
| **Dark** | Dark theme (default) |
| **Light** | Light theme |

Your theme preference is saved per-user and applied across the entire interface.

### Keyboard Input Mode

Controls how keyboard input is sent during remote control sessions:

| Mode | Description |
|------|-------------|
| **Auto** | Automatically detects the correct input mode (default) |
| **Physical** | Sends physical key events: may not work with all applications |
| **Virtual** | Sends virtual key events: better compatibility with some applications |

## Remote Control Preferences

### View Mode

| Mode | Description |
|------|-------------|
| **Fit** | Scale to fit the browser window, maintaining aspect ratio (default) |
| **Stretch** | Scale to fill the browser window (may distort aspect ratio) |
| **Scale** | Fixed scale percentage |

### Quality Settings

| Setting | Description |
|---------|-------------|
| **Auto Quality** | Automatically adjusts quality based on network conditions (default) |
| **Manual** | Fixed quality level with configurable threshold |
| **Max Bandwidth** | Cap for maximum bandwidth usage (kbps) |

### Capture Settings

| Setting | Description |
|---------|-------------|
| **Show Cursor** | Display the remote cursor in the stream |
| **DirectX Capture** | Use DirectX for screen capture (Windows, better performance) |

## Notification Preferences

| Setting | Description |
|---------|-------------|
| **Remote Control Notification** | Show a notification on the remote device when a session starts |

This can be overridden at the tenant level via `notify-user-on-session-start`.

## Information

The Settings page also displays:

| Field | Description |
|-------|-------------|
| **Tenant ID** | Your tenant's unique identifier |
| **User ID** | Your user's unique identifier |
| **Display Name** | Your configured display name |

## Next

- **[Dashboard](/docs/user-guide/dashboard)**: Overview of all devices
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
