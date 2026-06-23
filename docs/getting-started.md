---
sidebar_position: 1
title: Getting Started
---

## What is ControlR?

ControlR is a self-hosted, cross-platform remote control system that lets you manage and control devices over a network. It consists of three main components:

- **Server**: A web-based application (ASP.NET Core) that manages connections, authentication, and device communication
- **Agent**: A headless service installed on target devices that provides remote control, file access, and terminal sessions
- **Desktop Client**: A live GUI application (Avalonia-based) that runs on target devices, giving local users visibility into remote sessions

## Core Concepts

### Server

The ControlR server (running as a Docker container or native deployment) manages:
- Connected agents and their device status
- Authentication and access control (roles, tags, permissions)
- WebSocket relay connections for remote control sessions
- SignalR hubs for real-time device communication

### Agent

The agent is installed on each device you want to manage. It:
- Registers the device with the server during installation
- Maintains a persistent SignalR connection to the server
- Provides remote control, file system, terminal, chat, and log streaming capabilities
- Runs as a background service (systemd on Linux, launchd on macOS, Windows Service on Windows)

### Desktop Client

The desktop client runs on the target device and:
- Provides a live GUI for the local user, showing when remote sessions are active
- Can be configured to notify users before sessions start
- Runs alongside the agent on the same machine

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Web Viewer  │────▶│   ControlR       │◀────│  Agent (Service) │
│  (Browser)   │     │   Server         │     │  (Target Device) │
│              │     │  (Docker/Native) │     │                  │
└─────────────┘     │                  │     ┌──────────────────┐
                    │                  │◀───▶│  Desktop Client  │
                    └──────────────────┘     │  (Target Device) │
                      ▲                      └──────────────────┘
                      │
              ┌───────┴────────┐
              │  Optional:     │
              │  WebSocket     │
              │  Relay Server  │
              └────────────────┘
```

## Prerequisites

Before installing ControlR, make sure you have:

- **Docker** and **Docker Compose** installed on your server
- **PostgreSQL 18** (if deploying natively, without Docker)
- A domain name (optional, for HTTPS)
- At least 1 GB of RAM available
- An open network port (default host port: `5120`, container port: `8080`)

## Next Steps

1. **[Installation](/docs/installation)**: Deploy ControlR using Docker or native installation
2. **[Configuration](/docs/configuration)**: Set up your server settings
3. **[Reverse Proxy](/docs/admin/reverse-proxy)**: Configure HTTPS with a reverse proxy

## Need Help?

- Join the [Discord community](https://discord.gg/JWJmMPc72H)
- Check the [GitHub Discussions](https://github.com/bitbound/ControlR/discussions)
- File an [issue on GitHub](https://github.com/bitbound/ControlR/issues)
