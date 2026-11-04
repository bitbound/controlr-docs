---
sidebar_position: 1
title: Features
---

ControlR is an open-source, self-hosted remote access system. This page lists what it does out of the box. Each section links to the guide that goes deeper.

![The ControlR dashboard showing the device grid with filters and live resource columns](/img/features/device-grid.png)

## Device Management

- **Real-time device grid.** Server-side search, sorting, and filtering by customer, device group, and tags, with live CPU, memory, and storage columns that update as heartbeats arrive.
- **Device overview.** System information, networking, drives, and live resource gauges for every device.
- **Desktop preview.** A single-frame snapshot of a device's desktop before you start a full session.
- **Power and lifecycle actions.** Shutdown, restart, uninstall, and remove behind confirmation dialogs, plus Wake-on-LAN to wake a powered-off machine from a peer on the same network.
- **Agent self-update.** The agent checks for updates when its service starts and every six hours after that, verifies the bundle's SHA256 hash, and installs it.

![Device overview page with system information, networking, and drive usage](/img/features/device-overview.png)

![Desktop preview thumbnail on a session card](/img/features/desktop-preview.png)

## Remote Access

- **Remote control.** Screen streaming and input forwarding in the browser, with view-only mode, clipboard sharing, a privacy screen, blocked user input, and Ctrl+Alt+Del (the last three on Windows).
- **Session picker.** Choose which desktop session to view when a device has more than one.
- **Headless remote control.** Remote-control machines that have no physical monitor attached, such as workstations in a closet, kiosks, and VM hosts, using a virtual display adapter.

![Session picker listing the desktop sessions available on a device](/img/features/session-select.png)

![An active remote control session streaming a desktop in the browser](/img/features/remote-control-session.png)

## Terminal, Chat, And Files

- **PowerShell terminal.** Run commands on a device from the browser.
- **Chat.** Message the person at the desktop. The desktop client shows a local toast when a session starts and ends.
- **File system.** Browse, upload, download, and delete files on a device.
- **Remote logs.** Read the agent's logs without signing in on the device.
- **VNC relay.** Stream from a VNC server running on the device.

![Remote terminal session in the browser](/img/features/remote-terminal.png)

![Chat panel in the web dashboard](/img/features/chat-web.png)

![File system browser with upload and download](/img/features/file-system.png)

## Deployment

- **Deploy page.** Generate the install script for a new device, with platform tabs for Windows, macOS, and Linux.
- **Installer keys.** Device registration is key-gated by default. The installer authenticates with a key you create in the web UI.
- **Outbound-only agents.** Agents run as a service and connect out to the server, so no inbound port is needed on the device.

![Deploy page with a generated agent install script](/img/features/deploy.png)

## Security And Access

- **Scoped permissions.** Permission assignments carry a level such as server, tenant, customer, device group, or single device instead of fixed roles.
- **Multi-tenancy.** Server, tenant, and per-user isolation on one deployment.
- **Sign-in options.** Browser cookie sessions, personal access tokens, service accounts, logon tokens, and invitations.

![ControlR sign-in screen](/img/features/login-screen.png)

![Permissions page showing a scoped permission assignment](/img/features/permissions.png)

## Automation And API

- **Versioned REST API.** Stable `/api/v1` endpoints with an OpenAPI spec.
- **Scalar API browser.** Explore the API from the server itself.
- **NuGet clients.** `ControlR.ApiClient` and the other published packages for .NET integrations.
- **Service accounts and PATs.** Credentials for server-to-server integrations, granted through the same permission assignments as users.

## Subscriber Portal

The [Subscriber Portal](/docs/subscriber-portal/overview) is separate from your ControlR server. GitHub sponsors sign in and manage the custom builds that come with a sponsorship.

- **Sponsorship dashboard.** See your tier, sponsorship state, and build slot count.
- **Branded builds.** Configure a slot with your branding and settings, then trigger a build and watch its progress.
- **Delivery.** Pull the result as a container image or download a server archive, depending on the slot.
- **Notifications.** Get an email when a build you started finishes.
- **Organization access.** Organization admins get portal access, and delegated members can reach specific build slots.

![Subscriber Portal sponsorship and build slot list](/img/features/portal-sponsorship.png)

![Build history with a running build](/img/features/portal-build-progress.png)

![Pull command panel for a finished container image build](/img/features/portal-getting-image.png)

## Administration

- **Docker or native install.** A Compose stack or a native Linux process backed by PostgreSQL.
- **Reverse proxy setup.** Required before remote access, with forwarded-header guidance.
- **Upgrades and backups.** Versioned upgrade steps and restore procedures.
- **Server alerts.** One server-wide banner message broadcast across the web interface.
- **Telemetry.** Optional OpenTelemetry export.

## Next

- **[Getting Started](/docs/getting-started)**: Components, prerequisites, and architecture overview
- **[Dashboard](/docs/user-guide/dashboard)**: The device grid in detail
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
- **[Subscriber Portal Overview](/docs/subscriber-portal/overview)**: Sponsor builds and slots
- **[API Overview](/docs/api/overview)**: REST endpoints and clients
