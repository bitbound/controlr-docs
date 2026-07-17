---
sidebar_position: 0
title: API Overview
---

## Overview

ControlR provides a RESTful API for programmatic access to its features. The API is split into three **route roots**, each serving a distinct audience with different contract stability guarantees.

## Route Architecture

| Route root | Audience | Contract stability | Versioning | Example |
|---|---|---|---|---|
| `/api/internal/*` | Blazor Web UI (BFF), device agents | Dynamic, evolves freely | No | `/api/internal/users` |
| `/api/v0/*` | Server-to-server (S2S) automation | Stable contract | Yes (`[ApiVersion("0")]`) | `/api/v0/service-accounts` |
| `/api/agent/*` | Device agents (anonymous) | Dynamic, evolves freely | No | `/api/agent/updates` |

### Internal Routes (`/api/internal/*`)

The Internal surface serves the Blazor WASM web UI. These controllers assume a user session and derive tenant and user context from claims. Endpoints evolve dynamically based on UI needs and carry no versioning.

**Legacy fallback:** All Internal controllers also respond at their old `/api/*` paths via dual-routing. For example, `UsersController` responds at both `/api/internal/users` (canonical) and `/api/users` (legacy). These legacy paths are maintained for backward compatibility and will be removed in a future release. New integrations should use the canonical `/api/internal/*` paths.

### V0 Routes (`/api/v0/*`)

The V0 surface is a **versioned, stable contract** for system-to-system (S2S) integrations. Key characteristics:

- All endpoints require a server-scoped service account or the `ServerAdministrator` role
- **No tenant claim** is derived; all identifiers (tenant ID, user ID, device ID) must be explicit in the request
- Uses ASP.NET Core API versioning with `[ApiVersion("0")]`
- Ideal for RMM platforms, automation scripts, and cross-tenant management

### Agent Routes (`/api/agent/*`)

Dedicated endpoints for device agent communication. These are anonymous and separate from both BFF and S2S surfaces.

## Base URL

```
https://your-controlr-server/api/internal/users
https://your-controlr-server/api/v0/service-accounts
https://your-controlr-server/api/agent/updates
```

## API Documentation

The easiest way to explore and test the API is through the **Scalar API Browser**:

1. Enable the Scalar UI by setting `ControlR_AppOptions__EnableScalarUi: true` in your configuration
2. Navigate to `https://your-server/scalar` in your browser
3. Browse endpoints, view request/response schemas, and test calls interactively

Alternatively, you can fetch the OpenAPI specification directly:

```
https://your-server/openapi/v1.json
```

A .NET typed API client is also published on NuGet as [`ControlR.ApiClient`](https://www.nuget.org/packages/ControlR.ApiClient/). The client uses a nested accessor pattern:

```csharp
// Cookie/PAT auth for Internal routes
var device = await api.Internal.Devices.GetDevice(deviceId);

// x-api-key auth for V0 routes
var account = await api.V0.ServiceAccounts.Get(accountId);
```

## Authentication

All API requests require authentication. ControlR supports multiple authentication methods:

| Method | Header | Use Case |
|--------|--------|----------|
| Cookie (web UI) | `Cookie` | Browser-based web UI sessions |
| Bearer Token | `Authorization: Bearer <token>` | Interactive login (desktop clients, scripts) |
| Personal Access Token | `x-personal-token: <token>` | Long-lived programmatic access |
| Service Account | `x-api-key: <id>:<secret>` | S2S automation, cross-tenant management |
| Logon Token | `?logonToken=xxx&deviceId=xxx` | Single-use device access URLs |

The dynamic authentication scheme routes each request to the correct handler by matching headers: `x-api-key` → Service Account → PAT → Bearer → Cookie.

See the [Authentication Guide](/docs/authentication-guide) for details on each method.

## Response Format

Successful responses return typed DTOs specific to each endpoint. Refer to the [OpenAPI specification](/openapi/v1.json) or [Scalar API Browser](/docs/scalar-api-browser) for the full schema of each endpoint.

## Error Handling

Errors use the [RFC 7807 Problem Details](https://tools.ietf.org/html/rfc7807) format with content type `application/problem+json`. All `/api` routes are covered by a global exception handler that returns Problem Details on unexpected errors.

**Standard HTTP status codes:**

| Code | Description |
|------|-------------|
| `400` | Bad Request: Invalid input or validation error (returns `HttpValidationProblemDetails` with per-field errors) |
| `401` | Unauthorized: Missing or invalid authentication |
| `403` | Forbidden: Authenticated but not authorized |
| `404` | Not Found: Resource does not exist |
| `429` | Too Many Requests: Rate limited |
| `500` | Internal Server Error: Unexpected server error (returns `ProblemDetails` with `traceId`) |

**Example 500 error response:**

```json
{
  "status": 500,
  "title": "An unexpected error occurred.",
  "detail": "An unexpected error occurred.",
  "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1",
  "traceId": "0HN6QO4CG7E8O:00000001"
}
```

## SignalR Hubs

Real-time communication uses two SignalR hubs (MessagePack protocol with JSON fallback):

| Hub | Path | Purpose |
|-----|------|---------|
| AgentHub | `/hubs/agent` | Agent device registration and updates |
| ViewerHub | `/hubs/viewer` | Viewer commands (remote control, terminal, files) |

The ViewerHub requires authentication. The AgentHub validates device identity on first update.

## Rate Limiting

Anonymous authentication endpoints (login, register, password reset) are rate-limited. Exceeded limits return `429 Too Many Requests` with a `Retry-After` header.

## Next

- **[Authentication](/docs/api/authentication)**: Detailed authentication guide
- **[Scalar API Browser](/docs/scalar-api-browser)**: Interactive API exploration
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
