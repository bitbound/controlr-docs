---
sidebar_position: 1
title: Remote Control
---

## Overview

Remote Control streams and controls the screen of a remote desktop session from the browser. Screen capture and input forwarding travel over a WebSocket relay through the ControlR server to the agent, which hands them to the desktop client running in the target session. The desktop client performs the actual capture and input simulation there. The device needs a logged-in graphical session for a desktop client to attach to.

Access requires the `device.remote-control.connect` permission. It gates the menu entry, the session list, and starting a session.

## Desktop Session Select

The page lists the device's active desktop sessions as cards. This step runs on every supported platform (Windows, macOS, and Linux), not just Windows. Each card shows:

| Label | Description |
|-------|-------------|
| **Session ID:** | The operating-system session identifier |
| **Process ID:** | Process identifier of the session's host process |
| **Session Name:** | Session name (for example, a console or RDP session name) |
| **Session Type:** | Session type. Shown only for Windows devices |
| **User:** | User who owns the session |
| **Desktop:** | Desktop name. Shown only when the device reports one |

A card can carry a **"Permissions not granted."** warning when the session needs an in-session grant (such as the macOS screen recording permission) before streaming works. **"Request Now"** sends that request to the remote user.

Other controls on this step:

- **Connect** starts the stream for that session
- **Preview** shows a snapshot before connecting. It requires the separate `device.desktop-preview.read` permission, and the button is hidden entirely when the server disables desktop previews
- **Refresh Sessions** reloads the list
- **Start View Only** connects without sending input

## Controls

### Toolbar

The active-session toolbar has four popovers, **View**, **Input**, **Quality**, and **Extras**, plus two icon buttons, **Toggle Fullscreen** and **Close Connection** (the disconnect button).

| Action | How |
|--------|-----|
| Zoom in / out | Ctrl + Shift + Mouse Wheel Up / Down. Fit and Stretch switch to Scale when you scroll-zoom |
| Set an exact scale | The **Scale Level** slider in the **View** popover |
| Full screen | **Toggle Fullscreen** |
| Disconnect | **Close Connection** |

The **Input** popover holds **View Only**, **Block User Input** (Windows devices, requires `device.remote-control.block-input`), the clipboard buttons **Send Clipboard**, **Receive Clipboard**, and **Type Clipboard** (gated by `device.clipboard.write` and `device.clipboard.read`), **Ctrl+Alt+Del**, and a per-session **Keyboard Input Mode** picker. The **View** popover holds the view mode, scale, an **Auto Pan** option that follows the remote cursor, a display picker, and a **Privacy Screen** toggle that blacks out the physical display while the stream stays visible (Windows only).

### Mobile / Touch Devices

| Gesture | Action |
|---------|--------|
| Pinch | Zoom. Two fingers pan while zoomed |
| Tap | Left-click |
| Double-tap | Double-click |
| Tap and hold | Right-click |
| Tap and hold, then drag | Left click-and-drag |
| One-finger drag (Scale mode) | Pan |

Touch mode also adds two toolbar toggles: **Scroll Mode**, which turns one-finger drags into scroll-wheel events, and **Virtual Keyboard**.

## Settings

Defaults are configured in **Settings** (`/settings`). Most can also be changed for the current session from the **View**, **Input**, and **Quality** popovers.

### Default View Mode

| Mode | Description |
|------|-------------|
| **Fit** | Scale to fit the browser window, maintaining aspect ratio |
| **Stretch** | Scale to fill the browser window (may distort aspect ratio) |
| **Scale** | Fixed scale percentage, adjustable with the **Scale Level** slider |

### Quality Settings

| Setting | Description |
|---------|-------------|
| **Enable auto quality** | Adjust quality automatically based on the sender's measured outbound bandwidth. Off by default |
| **Manual Quality** | Fixed quality level from 1 to 100 (default 75) used while auto quality is off |
| **Auto Quality Maximum** / **Auto Quality Minimum** | Quality bounds used by auto mode |
| **Auto Quality Lower Threshold** / **Auto Quality Upper Threshold** | Bandwidth points (Mbps) where auto mode starts dropping quality and bottoms out |
| **Enable Max Mbps** / **Max Mbps** | Hard outbound bandwidth cap. While measured bandwidth is above the cap, capture pauses on the remote end and resumes when it falls back |

### Capture Settings

| Setting | Description |
|---------|--------|
| **Capture cursor** | Include the remote cursor in the stream. Off by default |
| **Enable DirectX** | Use DirectX capture for better performance. On by default. Applies only on Windows devices. Other platforms ignore it |

### Encoding

**Encoding Format** selects **WebP** (better compression, slower to encode) or **JPEG** (more bandwidth, faster to encode). JPEG is the default.

## Connection States

| State | Description |
|-------|-------------|
| **Loading** | Fetching desktop sessions or starting a session |
| **Alert** | An error or warning occurred, with a **Reload** button |
| **Session Select** | Waiting for you to select a desktop session |
| **Active** | The session is streaming |
| **Reconnecting** | Retrying after a lost connection. Automatic reconnect re-uses the session when there is exactly one on the device |
| **Unsupported OS** | The device platform is not Windows, macOS, or Linux |

## Keyboard Input Modes

Keyboard input can be configured as a default in Settings under **Default Keyboard Input Mode** and per session in the **Input** popover.

| Mode | Description |
|------|-------------|
| **Auto** | Types the logical character for text input while keeping physical-style handling for commands, navigation keys, and modifiers |
| **Physical** | Simulates the same physical key position on the remote machine, regardless of keyboard layout |
| **Virtual** | Prefers the logical key or character value, so pressing a key types that same character regardless of the remote layout |

## Server Notifications

Remote users are notified when a session starts. The user preference is the **Notify users when a remote control session starts** checkbox on the Settings page, on by default. The tenant setting `notify-user-on-session-start` (configurable at `/tenant-settings`, with options "Use individual account setting", "Always notify users", and "Never notify users") overrides it. The server resolves the effective value when the session starts, so a tenant enforcement always wins.

## Invoke Ctrl+Alt+Del (Windows)

The **Ctrl+Alt+Del** button sits under "Security" in the **Input** popover. It renders only for Windows devices and only when you hold the `device.ctrl-alt-del.send` permission. This is useful for signing into a locked session or reaching the security screen.

## Permissions

| Permission code | Gates |
|-----------------|-------|
| `device.remote-control.connect` | Menu entry, session list, and session start |
| `device.desktop-preview.read` | The **Preview** button on session cards |
| `device.remote-control.block-input` | The **Block User Input** toggle (Windows only) |
| `device.ctrl-alt-del.send` | The **Ctrl+Alt+Del** button (Windows only) |
| `device.clipboard.read` / `device.clipboard.write` | Receiving / sending and typing clipboard content |

## VNC Relay

Devices that run a VNC server can also be controlled through the VNC Relay feature. See [VNC Relay](/docs/user-guide/device-access/vnc-relay) for details.
