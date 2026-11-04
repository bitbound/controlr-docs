---
sidebar_position: 10
title: FAQ
---

## Frequently Asked Questions

### Is ControlR free to use?

Yes. ControlR is MIT licensed. See the [LICENSE](https://github.com/bitbound/ControlR/blob/main/LICENSE.txt) in the repository.

### Can I use ControlR without Docker?

Docker is the recommended deployment. Native Linux installation is also supported. The server is published as a ZIP archive and runs as a systemd service. See the [Native Installation](/docs/admin/native-installation) guide.

### What platforms are supported for clients?

ControlR agents run on Windows 11, macOS (Apple Silicon, plus Intel builds that are not part of the pre-release test pass), and Linux on AMD64 with either X11 or Wayland. There is no ARM Linux agent. The web interface runs in any modern browser, and a responsive mobile layout covers phones and tablets. See [Agent OS Support](/docs/agent-os-support).

### How many devices can one ControlR server handle?

There is no fixed maximum, but the practical limit depends on your environment:

- **Server resource use**: every agent connects to the server over a persistent outbound SignalR connection. The server talks to Postgres through EF Core. CPU and RAM on the server scale with agent count, request concurrency, and how often agents push updates. Memory includes per-device metadata, recent state, and pending operations on the server.
- **Ephemeral port exhaustion through a reverse proxy**: each agent and each active web viewer holds one long-lived connection through the proxy, and each one consumes a source port on the proxy side. A same-host proxy dialing a single destination draws from one range, and the Linux default `net.ipv4.ip_local_port_range` of 32768 to 60999 is about 28,000 ports. nginx reports the failure as `connect() failed (99: Cannot assign requested address)`. Widen the range, raise the proxy's file-descriptor and connection limits, and add source addresses with something like nginx `proxy_bind` before concluding the ControlR server is the limit. `SO_REUSEPORT` is not a fix. It spreads incoming connections across listening sockets and has nothing to do with outbound ports.
- **Hosting platform caps**: Azure App Service, AWS ECS, and similar managed platforms impose per-instance connection limits that vary by SKU/tier. Compare their max-connection documentation against (agents + concurrent viewers).
- **Server-side database connection pool**: EF Core opens Postgres connections from a single Npgsql pool. The server assembles the connection from its database settings and does not expose the pool size, so Npgsql's default maximum of 100 connections applies. Concurrent HTTP requests on the server share this pool. Under sustained high request concurrency, scale the server horizontally behind a load balancer or put PgBouncer in front.

### Is data encrypted in transit?

Yes. TLS is terminated by a reverse proxy in front of the server, and that is the supported arrangement. ControlR does not support exposing the server's own web listener to the internet, so treat a proxy as required for anything reachable beyond the local machine. Agents and viewers only establish outbound connections to the server, so no inbound ports need to be exposed on their networks. See [Reverse Proxy](/docs/admin/reverse-proxy).

TLS is applied hop by hop. When a proxy terminates TLS, the proxy-to-server hop stays plain HTTP unless you configure TLS there as well. Remote-control screen data is relayed through the server over that same TLS connection, and it is not encrypted a second time end to end.

### Do I need to open any ports on the agent machine?

No. All agent traffic is outbound (SignalR-over-WebSocket and HTTPS). No inbound ports need to be opened on the agent's network.

### Does my data leave my network?

Not by default. ControlR does not "phone home". Telemetry only exports to whatever destination you configure (`ControlR_OTLP_ENDPOINT_URL` or `ControlR_AzureMonitor__ConnectionString`). Without those settings, no exporter is registered and no telemetry leaves your server.

Two things are worth knowing about. Turning on `ControlR_AppOptions__EnableCloudflareProxySupport` makes the server fetch Cloudflare's published IP ranges from `www.cloudflare.com` during startup. And the example `docker-compose.yml` sets `ControlR_OTLP_ENDPOINT_URL` to the local Aspire dashboard container, which stays on your network.

Agent updates do not reach the internet. An agent asks your server for bundle metadata and downloads the bundle and installer from your server's own `/downloads` paths.

### How do I upgrade ControlR?

See the [Upgrading guide](/docs/admin/upgrading) for step-by-step instructions.

### The agent or desktop client will not start or crashes immediately. What should I check?

The agent and the desktop client log to files. Neither one writes to the Windows event log, so the event logs below show what Windows itself did to the process.

1. Check the agent's and desktop client's log files. The [Remote Logs](/docs/user-guide/device-access/remote-logs) page streams them through the agent, with no local access needed, and that page lists the on-disk paths.
2. Check **Event Viewer &rarr; Windows Logs &rarr; Application** for any .NET runtime errors related to ControlR.
3. Check **Event Viewer &rarr; Applications and Services &rarr; Microsoft &rarr; Windows &rarr; CodeIntegrity &rarr; Operational** for code integrity violations that may be blocking the agent.
4. Check **Event Viewer &rarr; Applications and Services &rarr; Microsoft &rarr; Windows &rarr; AppLocker &rarr; EXE and DLL** for AppLocker blocks.