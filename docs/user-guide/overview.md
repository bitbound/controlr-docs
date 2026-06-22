---
sidebar_position: 0
title: Device Overview
---

## Overview

Navigate to a device from the Dashboard to view its overview page. This provides a comprehensive summary of the device's status, system information, networking, and resource usage.

## Device Summary

The overview displays a summary section with the following information:

| Field | Description |
|-------|-------------|
| **Name** | Editable alias for the device — click the edit icon to change |
| **Online Status** | Online (check icon), Offline (cancel icon), or Outdated (warning icon) |
| **Platform** | Icon indicating Windows, macOS, or Linux |
| **Device ID** | Unique GUID — click the copy icon to copy to clipboard |
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

- **CPU Usage** — Real-time CPU utilization percentage
- **Memory Usage** — Real-time memory utilization percentage

## Drives

Each detected storage drive is displayed with:

| Field | Description |
|-------|-------------|
| **Name** | Drive volume name |
| **Volume Label** | Human-readable label |
| **Format** | File system format (e.g., NTFS, ext4, APFS) |
| **Root Directory** | Drive root path |
| **Storage** — Donut chart showing used vs. free space with total capacity |

## Updating Agents

Agents automatically check for updates when connected to the server. You can trigger an update check manually:

- From the device access page, use the **Refresh Device Info** command
- Or send an update trigger via the SignalR hub

## Next

- **[Devices & Tags](/docs/user-guide/devices)** — Manage device groups and access control
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)** — Screen streaming and control
- **[Device Access: Terminal](/docs/user-guide/terminal)** — Remote PowerShell access
