---
sidebar_position: 4
title: Remote Logs
---

## Overview

The Remote Logs page lets you view, search, and download log files from connected agents. This is essential for troubleshooting agent issues.

## Accessing Remote Logs

1. Navigate to a device's page
2. Click **Remote Logs** in the device access menu
3. Or go directly to `/device-access/remote-logs?deviceId={id}`

## Interface

The Remote Logs page uses a split-pane layout:

| Panel | Description |
|-------|-------------|
| **Left Panel** | Tree-view of log files on the remote device |
| **Right Panel** | Log content viewer with syntax highlighting |

## Operations

### Browsing

- Click log files in the tree view to open them
- Use the search box to filter log entries
- Click **Refresh** to reload the current file

### Viewing

- Log content is displayed with syntax highlighting for improved readability
- Scroll through the full log history
- Navigate between different log files

### Managing

| Action | Description |
|--------|-------------|
| **Download** | Download the current log file |
| **Copy to Clipboard** | Copy the log content to your clipboard |
| **Refresh** | Reload the current log file |

## Agent Log Locations

When accessing logs from the Remote Logs page, files are streamed from the agent's local storage:

| Platform | Path |
|----------|------|
| **Windows (Release)** | `C:\ProgramData\ControlR\{hostname}\Logs\ControlR.Agent\LogFile{date}.log` |
| **Windows (Debug)** | `C:\ProgramData\ControlR\Debug\{hostname}\Logs\ControlR.Agent\LogFile{date}.log` |
| **macOS / Linux (root)** | `/var/log/controlr/{hostname}/ControlR.Agent/LogFile{date}.log` |
| **macOS / Linux (user)** | `~/.controlr/logs/{hostname}/ControlR.Agent/LogFile{date}.log` |

Desktop client logs follow the same pattern under `ControlR.DesktopClient`.

## Next

- **[Terminal](/docs/user-guide/terminal)** — Remote PowerShell access
- **[VNC Relay](/docs/user-guide/vnc-relay)** — VNC remote access
