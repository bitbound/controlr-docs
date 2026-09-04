---
sidebar_position: 6
title: Telemetry & Monitoring
---

## Overview

ControlR supports exporting telemetry data via **OpenTelemetry (OTLP)** for observability. You can send traces, metrics, and logs to an OpenTelemetry collector, the **Aspire Dashboard**, or **Azure Monitor** (Application Insights).

## Architecture

ControlR exports OpenTelemetry traces, metrics, and logs to whichever destination you configure. Both the server (ASP.NET Core) and the agent (.NET) publish telemetry independently, and you can run them with no exporter configured at all.

Common exporter paths:

```
                  ┌─────────────────────┐
ControlR Server ──┤  OTLP endpoint      ├──▶ Aspire Dashboard
ControlR Agent  ──┤  (gRPC or HTTP)     │
                  └─────────────────────┘

                  ┌─────────────────────┐
ControlR Server ──┤  Azure Monitor      ├──▶ Application Insights
ControlR Agent  ──┤  (ConnectionString) │
                  └─────────────────────┘
```

`OTLP_ENDPOINT_URL` and `AzureMonitor:ConnectionString` are configured independently: set either, both, or neither. If neither is set, no telemetry is exported.

## Aspire Dashboard

The Aspire Dashboard provides a local web UI for viewing traces, logs, and metrics in real time. It's included in the Docker Compose setup.

### Configuration

```yaml
# docker-compose.yml
ControlR_OTLP_ENDPOINT_URL: "http://aspire:18889"
```

| Variable | Description |
|----------|-------------|
| `ControlR_OTLP_ENDPOINT_URL` | OTLP gRPC endpoint for the Aspire Dashboard (e.g., `http://aspire:18889`) |
| `ControlR_AspireDashboard__PublicWebUrl` | Public-facing URL for the Aspire Dashboard web UI |
| `ControlR_AspireDashboard__Token` | Authentication token required to access the dashboard |

### Accessing the Dashboard

1. Ensure the Aspire Dashboard container is running alongside ControlR
2. Retrieve the dashboard URL (with embedded auth token) via the API:

```bash
curl https://your-server/api/server-logs/get-aspire-url \
  -H "x-personal-token: <tokenId>:<secret>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://aspire-dashboard-url?token=abc123"
  }
}
```

Navigate to this URL in your browser to view live telemetry data.

## Azure Monitor (Application Insights)

ControlR can export telemetry directly to Azure Monitor, allowing you to view traces, metrics, and logs alongside your other Azure resources.

### Prerequisites

- An Azure subscription with an **Application Insights** resource
- The **Connection String** from the Application Insights resource overview page

### Configuration

Set the Azure Monitor connection string in your Docker Compose or environment configuration:

```yaml
ControlR_AzureMonitor__ConnectionString: "InstrumentationKey=...;IngestionEndpoint=https://..."
```

### What Gets Exported

| Telemetry Type | Data Exported |
|---------------|---------------|
| **Traces** | HTTP request logs, SignalR hub calls, background service operations |
| **Metrics** | Request rates, error rates, resource utilization |
| **Logs** | ASP.NET Core and application-level log messages |

### Viewing in Azure

1. Go to your Application Insights resource in the Azure Portal
2. Use **Transaction Search** to explore individual request traces
3. Use **Metrics** to view aggregated performance data
4. Set up **Log Analytics** queries for custom analysis

## Configuration Reference

| Variable | Type | Description |
|----------|------|-------------|
| `ControlR_OTLP_ENDPOINT_URL` | string? | OTLP gRPC endpoint URL (e.g., `http://aspire:18889`) |
| `ControlR_AzureMonitor__ConnectionString` | string? | Azure Monitor / Application Insights connection string |
| `ControlR_AspireDashboard__PublicWebUrl` | Uri? | Public URL for the Aspire Dashboard web UI |
| `ControlR_AspireDashboard__Token` | string? | Access token for the Aspire Dashboard |

## Data Privacy

- Telemetry data never leaves your infrastructure unless you configure Azure Monitor export
- No telemetry is sent to third-party services by default
- The OTLP endpoint and Azure Monitor connection string are optional: omit them for no telemetry export

## Next

- **[Configuration](/docs/configuration)**: Full server configuration reference
- **[Server Alerts](/docs/admin/server-alerts)**: Broadcasting messages to users
