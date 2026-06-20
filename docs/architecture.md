---
sidebar_position: 2
title: Architecture
---

## Component Overview

```
┌──────────────┐     ┌──────────────────────────────┐     ┌──────────────────┐
│  Web Viewer   │────▶│        ControlR Server        │◀────│    Agent         │
│  (Browser)   │     │  (ASP.NET Core + SignalR)     │     │  (Headless Svc)  │
│              │     │                               │     │                  │
└──────────────┘     │  ├── Auth (Identity + PAT)    │     │  ├── Remote Ctrl  │
                     │  ├── SignalR Hubs             │     │  ├── File System  │
                     │  ├── REST API                 │     │  ├── Terminal     │
                     │  ├── Data (PostgreSQL)        │     │  ├── Chat         │
                     │  └── Telemetry (OTLP)         │     │  └── Log Stream  │
                     └──────────────────────────────┘     └──────────────────┘
                            ▲                                    ▲
                            │                                    │
                     ┌──────┴──────┐                     ┌──────┴──────┐
                     │  Aspire     │                     │  Desktop    │
                     │  Dashboard  │◀───────────────────▶│  Client     │
                     │  (Telemetry)│                     │  (Avalonia) │
                     └─────────────┘                     └─────────────┘
                            ▲
                            │
                     ┌──────┴──────┐
                     │ WebSocket   │
                     │  Relay      │
                     │  (Optional) │
                     └─────────────┘
```

## Server Component

**Project:** `ControlR.Web.Server`

The server orchestrates all ControlR components, built on ASP.NET Core with the following responsibilities:

| Responsibility | Technology |
|---------------|------------|
| **REST API** | ASP.NET Core Minimal API / Controllers |
| **Real-time communication** | SignalR (MessagePack protocol) |
| **Authentication** | ASP.NET Core Identity + custom schemes |
| **Authorization** | Role-based + resource-based (tags) |
| **Data persistence** | EF Core with PostgreSQL |
| **OpenAPI/Swagger** | Scalar.AspNetCore |
| **Telemetry** | OpenTelemetry (OTLP export) |

The server runs as a Docker container (default port 8080) or can be deployed natively.

### Authentication Pipeline

The server supports four authentication schemes routed through a dynamic policy scheme:

1. **Identity Cookie** — Default for web UI (Blazor WASM)
2. **Logon Token** — Query-param based for device access URLs
3. **Bearer Token** — ASP.NET Core Identity bearer tokens
4. **Personal Access Token** — Header-based (`x-personal-token`)

### SignalR Hubs

Two SignalR hubs handle real-time communication:

| Hub | Path | Purpose |
|-----|------|---------|
| **AgentHub** | `/hubs/agent` | Agents register, send updates, receive commands |
| **ViewerHub** | `/hubs/viewer` | Viewers send commands (remote control, terminal, files) |

## Agent Component

**Project:** `ControlR.Agent`, `ControlR.Agent.Shared`, `ControlR.Agent.Installer`

The agent is installed on each target device. It runs as a headless service and provides:

| Capability | Description |
|------------|-------------|
| **Remote Control** | Screen capture and input forwarding |
| **File System** | Browse, upload, download files |
| **Terminal** | Cross-platform PowerShell |
| **Chat** | Real-time messaging |
| **Log Streaming** | Stream log files to viewers |
| **Auto Update** | Periodically checks for and applies updates |

### Platform Support

| Platform | Remote Control | Terminal | Auto-Update |
|----------|---------------|----------|-------------|
| Windows 11 (x64, x86) | Full | Yes | Yes |
| macOS Apple Silicon (M1+) | Full | Yes | Yes |
| Linux AMD64 (X11) | Full | Yes | Yes |
| Linux (Wayland) | Experimental | Yes | Yes |
| macOS (VNC) | Experimental | Yes | Yes |

## Desktop Client

**Project:** `ControlR.DesktopClient`, `ControlR.DesktopClient.*`

The desktop client is an Avalonia-based application that runs on the target device alongside the agent. It provides:

- Live visibility of remote sessions to the local user
- Optional session start notifications
- Runs as a background service (systemd user service on Linux, launchd agent on macOS, Windows service)

## WebSocket Relay (Optional)

**Project:** `ControlR.Web.WebSocketRelay`

The WebSocket relay is an optional infrastructure component for geographically distributed deployments. It transfers remote control sessions to a server closer to the viewer, reducing latency.

## Database

**Technology:** PostgreSQL (via EF Core)

The database stores:
- Device registrations and status
- User accounts and roles
- Tenant settings and data
- Installer keys and usage history
- Personal access tokens
- Invitations and tags

## Telemetry

**Technology:** ASP.NET Aspire Dashboard + OpenTelemetry

The Aspire Dashboard provides:
- Application metrics
- Request/response traces
- Log aggregation
- Resource monitoring

Configured via `ControlR_AspireDashboard__Token` and `ControlR_AspireDashboard__PublicWebUrl`.

## Communication Flow

1. **Agent** connects to the server via SignalR (AgentHub)
2. **Viewer** (browser) connects to the server via SignalR (ViewerHub)
3. **Viewer** requests remote control through ViewerHub
4. **Server** forwards the request to the **Agent** via AgentHub
5. **Agent** starts screen capture and streams frames back through the server to the **Viewer**
6. **Viewer** sends input (mouse/keyboard) through ViewerHub, which the server forwards to the Agent

## Next

- **[Getting Started](/docs/getting-started)** — Overview and quick start
- **[Configuration](/docs/configuration)** — Configuration options
