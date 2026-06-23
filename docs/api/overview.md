---
sidebar_position: 0
title: API Overview
---

## Overview

ControlR provides a RESTful API for programmatic access to its features. The API is built on ASP.NET Core Identity and uses standard HTTP methods with JSON payloads.

## Base URL

All API endpoints use the `/api/` prefix with **no versioning**:

```
https://your-controlr-server/api/auth/login
https://your-controlr-server/api/devices
https://your-controlr-server/api/tags
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

A .NET typed API client is also published on NuGet as [`ControlR.ApiClient`](https://www.nuget.org/packages/ControlR.ApiClient/).

## Authentication

All API requests require authentication. ControlR supports multiple authentication methods:

| Method | Header | Use Case |
|--------|--------|----------|
| Cookie (web UI) | `Cookie` | Browser-based web UI sessions |
| Bearer Token | `Authorization: Bearer <token>` | Interactive login (desktop clients, scripts) |
| Personal Access Token | `x-personal-token: <token>` | Long-lived programmatic access |
| Logon Token | `?logonToken=xxx&deviceId=xxx` | Single-use device access URLs |

See the [Authentication Guide](/docs/authentication-guide) for details on each method.

## Response Format

API responses follow ASP.NET Core Identity conventions. Successful responses typically return:

```json
{
  "data": { ... },
  "errors": []
}
```

Error responses include an `errors` array with details:

```json
{
  "success": false,
  "errors": [
    { "code": "InvalidCredentials", "description": "The username or password is incorrect." }
  ]
}
```

## Error Handling

Standard HTTP status codes are used:

| Code | Description |
|------|-------------|
| `400` | Bad Request: Invalid input or validation error |
| `401` | Unauthorized: Missing or invalid authentication |
| `403` | Forbidden: Authenticated but not authorized |
| `404` | Not Found: Resource does not exist |
| `429` | Too Many Requests: Rate limited |
| `500` | Internal Server Error: Unexpected server error |

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
