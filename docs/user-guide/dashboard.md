---
sidebar_position: 0
title: Dashboard
---

## Overview

The Dashboard is the main landing page when you log into ControlR. It shows all connected devices, with filters for online/offline status and tags.

## Device Grid

The central feature of the Dashboard is the device grid, which displays all devices connected to your tenant. Each device card shows:

| Field | Description |
|-------|-------------|
| **Alias** | Your friendly name for the device |
| **OS Icon** | Operating system indicator (Windows, macOS, Linux) |
| **Status** | Online or Offline with last heartbeat timestamp |
| **Agent Version** | Version of the installed agent |
| **Platform** | Hardware platform (x64, ARM64, etc.) |
| **Tags** | Associated tags for access control |

## Actions

Click on any device card to open the **Device Overview** page, where you can:

- Edit the device alias
- Access remote control, terminal, chat, file system, remote logs, and VNC relay
- View detailed device information

## Connection Status

A connection indicator in the top navigation bar shows the SignalR hub connection status:

| Status | Meaning |
|--------|---------|
| **Connected** | Real-time device updates are flowing |
| **Disconnected** | Connection lost: auto-reconnecting |
| **Reconnecting** | Attempting to re-establish the connection |

## Theme

Toggle between dark and light mode using the theme button in the navigation bar. Your preference is saved per-user.

## Next

- **[Device Overview](/docs/user-guide/overview)**: View device details and manage actions
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Stream and control device screens
- **[Devices & Tags](/docs/user-guide/devices)**: Organize devices with tags
