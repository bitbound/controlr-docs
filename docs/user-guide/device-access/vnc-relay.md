---
sidebar_position: 6
title: VNC Relay
---

## Overview

VNC Relay provides remote access to a device that runs a VNC server. It streams a noVNC session through the ControlR server to the agent, which proxies the traffic to the VNC server on the target device. The feature is experimental, and it is not restricted by operating system. Nothing in the client, hub, or agent limits it to macOS and Linux. Any platform the agent runs on works as long as something is listening for VNC on the device's loopback interface.

Access requires the `device.vnc-relay.connect` permission. It gates the menu entry, the connection test, and the Connect action.

## Prerequisites

- A VNC server must already be running on the target device and accepting connections from loopback/localhost. ControlR never starts one for you
- Configure that VNC server to listen on localhost (127.0.0.1) only, for security
- The `device.vnc-relay.connect` permission for your account

## Accessing VNC Relay

1. Navigate to a device's page
2. Click **VNC Relay** in the device access menu
3. Or go directly to `/device-access/vnc-relay?deviceId={id}`

## Usage

1. Enter the **VNC Port** (default: `5900`)
2. Click **Test** to open a probe TCP connection to that port on the device. A failure reports "The VNC service is not running or not reachable on the remote device."
3. Click **Connect** to start the session. A noVNC frame opens in the page and connects automatically
4. During an active session, click **Disconnect** to end the connection

## How the Relay Works

Each session gets a random session ID and a shared access token. The page opens the viewer leg as an authenticated user, and the agent opens the responder leg. The server pairs the two WebSocket connections and pumps bytes both ways, so no inbound port is needed on the device. Each leg has 30 seconds to arrive before the relay gives up on the pairing.

## Security

Since the agent only proxies to the loopback interface on its own machine, you can configure your VNC server to bind only to loopback. This prevents the VNC port from being exposed on your local network. The relay itself requires an authenticated ControlR user on the viewer side plus the session's access token before pairing the two legs.

## Known Limitations

- Experimental feature: may have reliability issues
- Requires a third-party VNC server to be running on the target device
- Performance depends on the VNC server implementation
- Apple Screen Sharing works on macOS as a VNC implementation

## Next

- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Native remote control (recommended)
- **[Device Access: Remote Logs](/docs/user-guide/device-access/remote-logs)**: View agent logs
