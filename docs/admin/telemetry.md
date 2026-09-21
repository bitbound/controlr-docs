---
sidebar_position: 6
title: Telemetry & Monitoring
---

## Overview

ControlR can export telemetry via **OpenTelemetry (OTLP)**. You can send data to an OpenTelemetry collector or the **Aspire Dashboard**, and it can export to **Azure Monitor** (Application Insights).

Both the server and the agent set up the same OpenTelemetry pipeline independently. Nothing is sent off the machine unless you configure an exporter. With no exporter configured, the instrumentation runs but no data leaves the process.

## What is collected

When an exporter is enabled, the same signals flow to whichever destination you configured.

| Signal | What is instrumented |
|---|---|
| **Traces** | Inbound ASP.NET Core HTTP requests (paths under `/health` are excluded), outbound HTTP client calls, and one application activity named `DeviceAccessSession` started from the viewer hub. There is no general SignalR, Entity Framework, or background-service tracing |
| **Metrics** | ASP.NET Core request metrics, HTTP client metrics, and .NET runtime metrics (process, GC, thread pool, CPU, memory) |
| **Logs** | Anything written through `Microsoft.Extensions.Logging`, which includes application code and framework logs, including logs from background services |

The OpenTelemetry resource carries `service.name` of `controlr` for the server and `controlr-agent` for the agent, with service namespace `controlr`. The agent also sets a `host.id` attribute to its device id.

## Choosing a destination

Two switches, read independently. Set either, both, or neither.

- An **OTLP endpoint**. The value must be an absolute URI. When present, an OTLP **gRPC** exporter is registered. Only gRPC is wired up. The code does not add an OTLP HTTP exporter.
- An **Azure Monitor connection string**. When present, the Azure Monitor OpenTelemetry exporter is registered.

If neither is set, no exporter is registered and no telemetry is exported.

### Which endpoint variable wins

The code reads the generic OTLP variable first and falls back to the project one:

1. `OTEL_EXPORTER_OTLP_ENDPOINT`
2. `OTLP_ENDPOINT_URL` (used only when `OTEL_EXPORTER_OTLP_ENDPOINT` is empty or unset)

So if both are set, `OTEL_EXPORTER_OTLP_ENDPOINT` wins. Because the exporter is only created when one of these resolves to an absolute URI, the OpenTelemetry SDK's own environment scanning is not what enables export here. These keys drive it.

### Server keys versus agent keys

The server and the agent read the same configuration keys, but through different environment providers.

- The **server** loads environment variables with a `ControlR_` prefix. Set `ControlR_OTLP_ENDPOINT_URL`, `ControlR_OTEL_EXPORTER_OTLP_ENDPOINT`, and `ControlR_AzureMonitor__ConnectionString`. A bare `OTLP_ENDPOINT_URL` is ignored by the server.
- The **agent** loads environment variables with no prefix. Set `OTLP_ENDPOINT_URL`, `OTEL_EXPORTER_OTLP_ENDPOINT`, and `AzureMonitor__ConnectionString` on the agent, or put them in the agent's `appsettings.json`.

## Aspire Dashboard

The Aspire Dashboard shows traces, logs, and metrics in a web UI. It is included in the Docker Compose setup. The agent exports to the same collector if you give the agent an OTLP endpoint pointing at it.

### Configuration

The bundled Compose file already enables OTLP export from the server to the Aspire container.

```yaml
# docker-compose.yml
ControlR_OTLP_ENDPOINT_URL: "http://aspire:18889"
```

| Variable | Description |
|---|---|
| `ControlR_OTLP_ENDPOINT_URL` | OTLP gRPC endpoint. `http://aspire:18889` is the Aspire container's collector port |
| `ControlR_OTEL_EXPORTER_OTLP_ENDPOINT` | Overrides the value above when set |
| `ControlR_AspireDashboard__PublicWebUrl` | Public URL where the dashboard web UI is reachable, for example through your reverse proxy |
| `ControlR_AspireDashboard__Token` | The dashboard's browser access token |

### Getting the dashboard link

The server exposes a link that opens the dashboard already signed in. The supported route is `GET /api/v1/server-logs/get-aspire-url`. It requires the `server.telemetry.read` permission.

```bash
curl https://your-server/api/v1/server-logs/get-aspire-url \
  -H "x-personal-token: <tokenId>:<secret>"
```

**Response:**

```json
{
  "isConfigured": true,
  "aspireUrl": "http://localhost:18888/login?t=abc123"
}
```

The response is a flat object with `isConfigured` and `aspireUrl`. When both `ControlR_AspireDashboard__PublicWebUrl` and `ControlR_AspireDashboard__Token` are set, `aspireUrl` is `PublicWebUrl` plus `/login?t=<token>`. Open it in a browser to reach the live dashboard. When either is unset, outside of Development the endpoint returns `isConfigured: false` and `aspireUrl: null`.

## Azure Monitor (Application Insights)

Set the Application Insights connection string to export the same traces, metrics, and logs to Azure Monitor.

```yaml
ControlR_AzureMonitor__ConnectionString: "InstrumentationKey=...;IngestionEndpoint=https://..."
```

For the agent, use the unprefixed key `AzureMonitor__ConnectionString`.

Then explore the data in the Application Insights resource. Use **Transaction Search** for individual request traces, **Metrics** for aggregates, and **Log Analytics** for custom queries.

## Configuration Reference

Server keys, all read with the `ControlR_` prefix.

| Variable | Type | Description |
|---|---|---|
| `ControlR_OTEL_EXPORTER_OTLP_ENDPOINT` | string? | Preferred OTLP gRPC endpoint. Checked first |
| `ControlR_OTLP_ENDPOINT_URL` | string? | Fallback OTLP gRPC endpoint, used when the one above is unset |
| `ControlR_AzureMonitor__ConnectionString` | string? | Azure Monitor / Application Insights connection string |
| `ControlR_AspireDashboard__PublicWebUrl` | Uri? | Public URL for the Aspire Dashboard web UI |
| `ControlR_AspireDashboard__Token` | string? | Browser access token for the Aspire Dashboard |

The agent uses the same keys without the prefix: `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTLP_ENDPOINT_URL`, and `AzureMonitor__ConnectionString`.

## Data Privacy

Nothing is sent to a third party by default. The only destinations are the OTLP endpoint and the Azure Monitor connection string you supply.

The bundled Compose file points the server's OTLP export at the local Aspire container. That traffic stays on your infrastructure. Point the endpoint at an external collector, or set the Azure Monitor connection string, when you want data to leave the box.

## Next

- **[Configuration](/docs/configuration)**: Full server configuration reference
- **[Server Alerts](/docs/admin/server-alerts)**: Broadcasting messages to users
