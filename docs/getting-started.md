---
sidebar_position: 1
title: Getting Started
---

## What is ControlR?

ControlR is a self-hosted, cross-platform remote control system that lets you manage and control devices over a network. It consists of a server component and client applications that connect to it.

## Core Concepts

### Server

The ControlR server manages:
- Connected devices and their status
- Authentication and access control
- Device-to-device communication
- File transfer operations

### Clients

Clients connect to the server and provide:
- Remote control interface
- File management
- Terminal access
- Screen sharing

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  ControlR    │     │   ControlR       │     │  ControlR    │
│  Client      │────▶│   Server         │◀────│  Client      │
│  (Browser)   │     │  (Docker)        │     │  (Native)    │
└─────────────┘     └──────────────────┘     └─────────────┘
```

## Prerequisites

Before installing ControlR, make sure you have:

- **Docker** and **Docker Compose** installed on your server
- A domain name (optional, for HTTPS)
- At least 1 GB of RAM available
- An open network port (default: 5120)

## Next Steps

1. **[Installation](/docs/installation)** — Deploy ControlR using Docker
2. **[Configuration](/docs/configuration)** — Set up your server settings
3. **[Reverse Proxy](/docs/admin/reverse-proxy)** — Configure HTTPS with a reverse proxy

## Need Help?

- Join the [Discord community](https://discord.gg/JWJmMPc72H)
- Check the [GitHub Discussions](https://github.com/bitbound/ControlR/discussions)
- File an [issue on GitHub](https://github.com/bitbound/ControlR/issues)
