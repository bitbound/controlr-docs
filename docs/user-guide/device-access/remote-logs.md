---
sidebar_position: 5
title: Remote Logs
---

## Overview

The Remote Logs page shows log files from a connected agent. You can filter within a file, copy its contents, or download it. Access requires the `device.logs.read` permission. It gates the menu entry, the file listing, and the log-content endpoint the page streams from.

## Accessing Remote Logs

1. Navigate to a device's page
2. Click **Remote Logs** in the device access menu
3. Or go directly to `/device-access/remote-logs?deviceId={id}`

## Interface

The Remote Logs page uses a split-pane layout:

| Panel | Description |
|-------|-------------|
| **Log Files** | Left panel, a tree of log files on the remote device |
| **Log Contents** | Right panel, a Monaco-based viewer for the selected file |

The tree is built by the agent and contains three groups: **Agent Logs**, **Installer Logs**, and **DesktopClient Logs**. On macOS and Linux the desktop client logs are split into **DesktopClient Logs (root)** plus a **DesktopClient Logs ({username})** group for every user home directory the agent can read.

## Operations

### Browsing

- Click log files in the tree view to open them
- Use the filter box ("Filter log contents") to narrow the displayed lines. The filter is a case-insensitive substring match applied in the browser to the already-loaded text, not a server-side search
- **Refresh Files** (left panel) reloads the tree, **Refresh Contents** reloads the selected file

### Viewing

- Log content is displayed with syntax highlighting for improved readability
- Scroll through the loaded file. How far back you can go depends on retention on the device, which keeps roughly the last 7 days of logs

### Managing

| Action | Description |
|--------|-------------|
| **Download Log File** | Saves the loaded file contents to your machine as a text file |
| **Copy to Clipboard** | Copies the full contents of the file, including lines hidden by the filter |

## Retention

The agent, installer, and desktop client each write a `LogFile.log` file that rolls over daily, producing names like `LogFile20260920.log`. Log files older than 7 days are deleted on the device, so the page can only show about a week of history.

## Agent Log Locations

When accessing logs from the Remote Logs page, files are streamed from the agent's local storage. The `{instance-id}` segment is the instance ID the agent was installed with. It defaults to the literal `default`, and the device hostname never appears in the path.

| Platform | Path |
|----------|------|
| **Windows (Release)** | `C:\ProgramData\ControlR\{instance-id}\Logs\ControlR.Agent\LogFile{date}.log` |
| **Windows (Debug)** | `C:\ProgramData\ControlR\Debug\{instance-id}\Logs\ControlR.Agent\LogFile{date}.log` |
| **macOS / Linux (elevated)** | `/var/log/controlr/{instance-id}/ControlR.Agent/LogFile{date}.log` |
| **macOS / Linux (user)** | `~/.controlr/{instance-id}/logs/ControlR.Agent/LogFile{date}.log` |

Desktop client logs follow the same pattern under `ControlR.DesktopClient` (on macOS and Linux, elevated processes log under `/var/log/controlr` and each user logs under their own `~/.controlr`). Installer logs follow it under `ControlR.Agent.Installer`.

## Next

- **[Device Access: Terminal](/docs/user-guide/device-access/terminal)**: Remote PowerShell access
- **[Device Access: VNC Relay](/docs/user-guide/device-access/vnc-relay)**: VNC remote access
