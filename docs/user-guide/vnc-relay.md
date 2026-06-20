---
sidebar_position: 5
title: VNC Relay
---

## Overview

VNC Relay provides experimental remote access to Mac and Linux devices using the VNC protocol. It streams a noVNC connection through the ControlR server to the agent, then to the VNC server on the target device.

## Prerequisites

- The target device must have a VNC server running
- The VNC server should be configured to listen on localhost (127.0.0.1) for security
- This feature is experimental on macOS and Linux

## Accessing VNC Relay

1. Navigate to a device's page
2. Click **VNC Relay** in the device access menu
3. Or go directly to `/device-access/vnc-relay?deviceId={id}`

## Usage

1. Enter the **VNC port** (default: `5900`)
2. Click **Test** to verify the VNC server is reachable
3. Click **Connect** to start the noVNC session
4. During an active session, click **Disconnect** to end the connection

## Security

Since the ControlR server relays the VNC connection through localhost on the agent, you can configure your VNC server to bind only to the loopback interface. This prevents the VNC port from being exposed on your local network.

## Known Limitations

- Experimental feature — may have reliability issues
- Requires a VNC server to be running on the target device
- Performance depends on the VNC server implementation
- Apple Screen Sharing is supported on macOS as an alternative VNC implementation

## Next

- **[Remote Control](/docs/user-guide/remote-control)** — Native remote control (recommended)
- **[Remote Logs](/docs/user-guide/remote-logs)** — View agent logs
