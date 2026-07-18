---
sidebar_position: 7
title: FAQ
---

## Frequently Asked Questions

### Is ControlR free to use?

Yes. ControlR is MIT licensed. See the [LICENSE](https://github.com/bitbound/ControlR/blob/main/LICENSE.txt) in the repository.

### Can I use ControlR without Docker?

Docker is the recommended deployment. Native Linux installation is also supported: the server is published as a ZIP archive and runs as a systemd service. See the [Native Installation](/docs/admin/native-installation) guide.

### What platforms are supported for clients?

ControlR agents run on Windows 11, macOS (Apple Silicon and Intel), and Linux (X11 and Wayland). The web interface runs in any modern browser. A touch-optimized mobile layout is included for phones and tablets. See [Agent OS Support](/docs/agent-os-support).

### How many devices can one ControlR server handle?

There is no fixed maximum, but the practical limit depends on your environment:

- **Server resource use**: every agent connects to the server over a persistent outbound SignalR connection; the server talks to Postgres through EF Core. CPU and RAM on the server scale with agent count, request concurrency, and how often agents push updates. Memory includes per-device metadata, recent state, and pending operations on the server.
- **Ephemeral port exhaustion through a reverse proxy**: if you terminate TLS at a load balancer or reverse proxy (nginx, HAProxy, Cloudflare), the proxy needs an outbound port for every agent and every active web viewer. A proxy with a narrow `net.ipv4.ip_local_port_range` and no source-port reuse can saturate before the server does. Widen the range, enable `SO_REUSEPORT`, and tune the proxy worker model.
- **Hosting platform caps**: Azure App Service, AWS ECS, and similar managed platforms impose per-instance connection limits that vary by SKU/tier. Compare their max-connection documentation against (agents + concurrent viewers).
- **Server-side database connection pool**: EF Core opens Postgres connections from a single Npgsql pool (default 100 connections, configurable via the connection string). Concurrent HTTP requests on the server share this pool. Under sustained high request concurrency, raise `Maximum Pool Size`, scale the server horizontally behind a load balancer, or put PgBouncer in front.

The `Tools/ControlR.Agent.LoadTester` project in the repository is a harness for stress-testing your specific deployment.

### Is data encrypted in transit?

Yes, when TLS is terminated in front of the server (reverse proxy) or directly by the server. Agents and viewers only establish outbound connections to the server, so no inbound ports need to be exposed. See [Reverse Proxy](/docs/admin/reverse-proxy).

### Do I need to open any ports on the agent machine?

No. All agent traffic is outbound (SignalR-over-WebSocket and HTTPS). No inbound ports need to be opened on the agent's network.

### Does my data leave my network?

Not by default. ControlR does not "phone home". Telemetry only exports to whatever destination you configure (`OTLP_ENDPOINT_URL` or `AzureMonitor__ConnectionString`). Without those settings, no telemetry leaves your server.

### How do I upgrade ControlR?

See the [Upgrading guide](/docs/admin/upgrading) for step-by-step instructions.

### The agent or desktop client will not start or crashes immediately. What should I check?

1. Check the agent's and desktop client's log files. The [Remote Logs](/docs/user-guide/device-access/remote-logs) page streams them from the agent without requiring local access, and the page lists the local file paths too.
2. Check **Event Viewer &rarr; Windows Logs &rarr; Application** for any .NET runtime errors related to ControlR.
3. Check **Event Viewer &rarr; Applications and Services &rarr; Microsoft &rarr; Windows &rarr; CodeIntegrity &rarr; Operational** for code integrity violations that may be blocking the agent.
4. Check **Event Viewer &rarr; Applications and Services &rarr; Microsoft &rarr; Windows &rarr; AppLocker &rarr; EXE and DLL** for AppLocker blocks.