---
sidebar_position: 1
title: Device Overview
---

## Overview

Open a device from the Dashboard to see its overview page: status, system info, networking, drives, and live resource usage.

Device access in the app has seven pages: Overview, Remote Control, Terminal, Chat, File System, Remote Logs, and VNC Relay. Each is gated by its own permission code. Viewing this page requires `device.read` and `device.overview.read`.

## Device Summary

The overview displays a summary section with the following information:

| Field | Description |
|-------|-------------|
| **Name** | The device name reported by the agent. Display-only |
| **Alias** | Editable label for the device. Select the edit icon on the Alias row to change it |
| **Customer** | The customer the device is assigned to |
| **Online Status** | Online (check icon), Online with an outdated agent (warning icon), or Offline (cancel icon) |
| **Platform** | Icon indicating Windows, macOS, or Linux |
| **Id** | Unique GUID. The copy button next to it copies the ID to the clipboard |
| **Agent Version** | Version of the installed agent |
| **Active Users** | Users with active sessions on the device. Shown only when at least one session is active |
| **Last Seen** | Timestamp of the last device heartbeat |

## System Information

Detailed system specs are displayed in the System Information section:

| Field | Description |
|-------|-------------|
| **OS Description** | Full OS description string |
| **Architecture** | CPU architecture (e.g., x64, ARM64) with 32/64-bit indicator |
| **Processor Count** | Number of processors/cores |
| **Total Memory** | RAM in GB |
| **Total Storage (OS)** | OS drive capacity in GB |
| **Used Storage (OS)** | Used space in GB with percentage |

## Networking

Network configuration for the device:

| Field | Description |
|-------|-------------|
| **Public IPv4** | Public IPv4 address |
| **Public IPv6** | Public IPv6 address |
| **Local IPv4** | Private/local IPv4 address |
| **Local IPv6** | Private/local IPv6 address |
| **DNS Hostname** | Device's DNS hostname |
| **MAC Addresses** | Network adapter MAC addresses |

## Resource Usage

Live resource metrics displayed as radial gauges:

- **CPU Usage**: Real-time CPU utilization percentage
- **Memory Usage**: Real-time memory utilization percentage

## Drives

Each detected storage drive is shown as a donut chart of used versus free space, with total capacity in the center, plus these details:

| Field | Description |
|-------|-------------|
| **Name** | Drive volume name |
| **Volume Label** | Human-readable label |
| **Format** | File system format (e.g., NTFS, ext4, APFS) |
| **Root Directory** | Drive root path |

## Updating Agents

The agent checks for updates when its service starts and every six hours after that. When the server offers a newer bundle, the agent downloads the platform installer from the server, verifies its SHA256 hash, and runs it to self-update. An agent refuses a bundle that was built for a different brand.

A device running an outdated agent shows the warning status icon. To force an update check, open the device's Actions menu on the Dashboard and select **Update**. That item appears for online devices with an outdated agent. The forced check runs even when auto-update is disabled on the device.

## Desktop Preview

Desktop Preview captures a single-frame JPEG snapshot of a device's desktop session. It captures the whole desktop, not an individual window. Previews work on Windows, macOS, and Linux. Unlike remote control, a preview does not establish a streaming session.

### Use Cases

- Check what a session is showing before connecting
- Confirm a device is interactively available without starting a full remote session
- See which desktop session is on screen when a device has more than one

### Accessing Desktop Preview

In the app, open the **Remote Control** page for the device and select **Preview** on a session card. The buttons are hidden when the server disables previews with the `DisableDesktopPreview` setting.

The versioned REST API also serves previews:

```bash
curl "https://your-server/api/v1/desktop-preview/{deviceId}/{targetProcessId}?tenantId={tenantId}" \
  -H "x-personal-token: <tokenId>:<secret>" \
  -o preview.jpg
```

The `targetProcessId` is the process ID of the desktop client that runs the session you want to capture.

### Requirements

| Requirement | Details |
|-------------|---------|
| **Platform** | Windows, macOS, or Linux |
| **Desktop session** | An active session with its desktop client running |
| **Capture permission** | The desktop client must hold the operating system's screen-capture permission. The agent checks it before capturing and the preview fails with the reason when it is missing |
| **User permission** | `device.desktop-preview.read` on the target device |
| **Server config** | `DisableDesktopPreview` must not be enabled |

## Wake-on-LAN

Wake-on-LAN (WOL) lets you send a magic packet to wake a device that is powered off but connected to the network. This is useful for:

- Waking machines during off-hours for maintenance
- Powering on workstations before employees arrive
- Restarting devices that have been shut down

### Sending a Wake-on-LAN Request

On the Dashboard, find the offline device, open its Actions menu, and select **Wake**. The action appears only for offline devices.

The server does not emit the packet itself. It looks for other online ControlR devices that share the target's public IPv4 address within the same tenant and customer, and instructs those devices to broadcast the magic packet. You therefore need at least one online ControlR device on the target's network. When none is found, no packet is sent and the action reports that.

### Requirements

| Requirement | Details |
|-------------|---------|
| **BIOS/UEFI** | Wake-on-LAN must be enabled in the device's BIOS/UEFI settings |
| **Network** | The magic packet must be able to reach the target device (consider VLANs and subnet routing) |
| **Online peer** | At least one other online ControlR device shares the target's public IPv4 address, tenant, and customer, and broadcasts the packet |
| **MAC Address** | The MAC addresses recorded on the device the last time it was online. They are listed under Networking above |
| **User permission** | `device.wake.send` |

## Next

- **[Devices & Tags](/docs/user-guide/devices)**: Manage device groups and access control
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
- **[Device Access: Terminal](/docs/user-guide/device-access/terminal)**: Remote PowerShell access
- **[Device Access: Chat](/docs/user-guide/device-access/chat)**: Message the user at the device
- **[Device Access: File System](/docs/user-guide/device-access/file-system)**: Browse and transfer files
- **[Device Access: Remote Logs](/docs/user-guide/device-access/remote-logs)**: Read the agent's logs
- **[Device Access: VNC Relay](/docs/user-guide/device-access/vnc-relay)**: Stream from a VNC server on the device
