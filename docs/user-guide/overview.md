---
sidebar_position: 0
title: Device Overview
---

## Overview

Open a device from the Dashboard to see its overview page: status, system info, networking, drives, and live resource usage.

## Device Summary

The overview displays a summary section with the following information:

| Field | Description |
|-------|-------------|
| **Name** | Editable alias for the device: click the edit icon to change |
| **Online Status** | Online (check icon), Offline (cancel icon), or Outdated (warning icon) |
| **Platform** | Icon indicating Windows, macOS, or Linux |
| **Device ID** | Unique GUID: click the copy icon to copy to clipboard |
| **Agent Version** | Version of the installed agent |
| **Active Users** | Currently logged-in users (shown only if users are active) |
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

Each detected storage drive is displayed with:

| Field | Description |
|-------|-------------|
| **Name** | Drive volume name |
| **Volume Label** | Human-readable label |
| **Format** | File system format (e.g., NTFS, ext4, APFS) |
| **Root Directory** | Drive root path |
| **Storage**: Donut chart showing used vs. free space with total capacity |

## Updating Agents

Agents automatically check for updates when connected to the server. You can trigger an update check manually:

- From the device access page, use the **Refresh Device Info** command
- Or send an update trigger via the SignalR hub

## Desktop Preview

Desktop Preview lets you request a **single-frame JPEG snapshot** of a specific process window on a Windows device. Unlike full remote control, previews are lightweight and don't establish a persistent streaming session.

### Use Cases

- Quickly verify which session is active on a device before connecting
- Preview a specific application window
- Confirm a device is interactively available without starting a full remote session

### Accessing Desktop Preview

Desktop Previews are available through the REST API:

```bash
curl https://your-server/api/desktop-preview/{deviceId}/{targetProcessId} \
  -H "x-personal-token: <tokenId>:<secret>" \
  -o preview.jpg
```

The preview is returned as a JPEG image. The `targetProcessId` parameter specifies the process ID of the desktop session or application window to capture.

### Requirements

| Requirement | Details |
|-------------|---------|
| **Platform** | Windows only |
| **Desktop Client** | Must be running on the target device |
| **Permissions** | Device access permission required |

## Wake-on-LAN

Wake-on-LAN (WOL) lets you send a magic packet to wake a device that is powered off but connected to the network. This is useful for:

- Waking machines during off-hours for maintenance
- Powering on workstations before employees arrive
- Restarting devices that have been shut down

### Sending a Wake-on-LAN Request

Wake-on-LAN is available through the **ViewerHub** SignalR hub. From the device access page, use the **Wake Device** action.

### Requirements

| Requirement | Details |
|-------------|---------|
| **BIOS/UEFI** | Wake-on-LAN must be enabled in the device's BIOS/UEFI settings |
| **Network** | The magic packet must be able to reach the target device (consider VLANs and subnet routing) |
| **MAC Address** | The device's MAC address must be known (displayed in the device overview) |

## Next

- **[Devices & Tags](/docs/user-guide/devices)**: Manage device groups and access control
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
- **[Device Access: Terminal](/docs/user-guide/device-access/terminal)**: Remote PowerShell access

