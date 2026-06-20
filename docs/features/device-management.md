---
sidebar_position: 0
title: Device Management
---

## Overview

ControlR provides comprehensive device management, allowing you to monitor, control, and organize connected devices from the web interface.

## Device Information

When you view a device, you can see the following information:

| Property | Description |
|----------|-------------|
| **Alias** | A friendly name you assign to the device |
| **Device ID** | Unique GUID assigned during agent installation |
| **OS** | Operating system (Windows, macOS, Linux) |
| **Platform** | Hardware platform (x64, ARM64, etc.) |
| **Agent Version** | Version of the installed agent |
| **Status** | Online/Offline status with last heartbeat timestamp |
| **Instance ID** | Multi-instance identifier (if configured) |
| **Tags** | Associated tags for access control and grouping |

## Device Actions

From the device overview page, you can access:

| Action | Route | Description |
|--------|-------|-------------|
| **Remote Control** | `/device-access/remote-control?deviceId={id}` | Stream the device screen and control it remotely |
| **Terminal** | `/device-access/terminal?deviceId={id}` | Open a remote PowerShell terminal session |
| **Chat** | `/device-access/chat?deviceId={id}` | Start a chat/messaging session with the device |
| **File System** | `/device-access/file-system?deviceId={id}` | Browse and manage files on the remote device |
| **Remote Logs** | `/device-access/remote-logs?deviceId={id}` | View and download log files from the agent |
| **VNC Relay** | `/device-access/vnc-relay?deviceId={id}` | Connect via VNC (Mac/Linux experimental) |

## Device Groups (Tags)

Devices are organized using **tags** — string labels that can be assigned to both devices and users. A user needs either the `DeviceSuperuser` role or a matching tag to access a device.

### Managing Tags

1. Navigate to **Permissions** in the web interface
2. Use the **Tags** tab to create, rename, or delete tags
3. Assign tags to devices and users through the **Devices** and **Users** tabs

### Tag Validation

- Tag names must match `[a-zA-Z0-9-]`
- Max length: 100 characters

## Registering Devices

Devices register with the server during agent installation:

1. Generate an installer key (or enable self-bootstrap)
2. Run the installer on the target device
3. The agent creates an Ed25519 key pair and registers the device
4. The device appears in the device grid automatically

## Updating Agents

Agents automatically check for updates when connected to the server. You can trigger an update check manually:

- From the device access page, use the **Refresh Device Info** command
- Or send an update trigger via the SignalR hub

## Next

- **[Remote Control](/docs/user-guide/remote-control)** — Screen streaming and input forwarding
- **[File System](/docs/user-guide/file-system)** — Remote file management
- **[Terminal](/docs/user-guide/terminal)** — Remote PowerShell access
