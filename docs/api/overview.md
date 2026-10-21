---
sidebar_position: 0
title: API Overview
---

## Overview

ControlR exposes a REST API and two SignalR hubs. The REST API is split into three route roots, each serving a distinct audience with different contract stability guarantees.

## Route Architecture

| Route root | Audience | Contract stability | Example |
|---|---|---|---|
| `/api/v1/*` | Server-to-server (S2S) automation | Stable contract, API version `1.0` | `/api/v1/devices` |
| `/api/*` | ControlR's own Blazor front-end (BFF) | Deprecated, evolves freely | `/api/devices` |
| `/api/agent/*` | Device agents | Agent contract, not for integrators | `/api/agent/devices` |

The three roots are described by two OpenAPI documents. The `v1` document covers `/api/v1/*`. The `internal` document covers both `/api/*` and `/api/agent/*`.

### V1 Routes (`/api/v1/*`)

The V1 surface is a **versioned, stable contract** for system-to-system (S2S) integrations. Build against it. Key characteristics:

- Controllers are declared at API version `1.0`. The server assumes that version when a request does not state one. The `/api/v1/` path segment selects the group, so there is no version header to send.
- Most actions take an explicit `tenantId` query parameter. A filter answers `400` when the value is absent or all zeroes. A server-scoped principal may name any tenant. Any other principal must name the tenant carried by its own claim, and a mismatch is answered `403` rather than `404`.
- Authorization is evaluated per endpoint against the fine-grained permission system. Most actions require a Tenant-scope or Device-scope permission, so a tenant service account or a user holding tenant-scoped grants can use them. Only the server-administration actions require a Server-scope permission.
- Ideal for RMM platforms, automation scripts, and cross-tenant management.

### Internal Routes (`/api/*`)

The Internal surface is what ControlR's own Blazor WebAssembly front-end calls. The server keeps it, and it is not a surface to integrate against. Seventy-one of its routes carry `[ApiDeprecated]`, and the `internal` OpenAPI document marks those operations `deprecated: true` and adds an `x-replacement-route` extension naming the V1 twin.

These endpoints derive tenant and user context from the caller's claims rather than from a request parameter. An unusable tenant claim is answered `403`. The V1 twin takes `tenantId` explicitly and answers `400` when it is missing, which is one reason a migrated caller should send the parameter explicitly.

### Agent Routes (`/api/agent/*`)

Update negotiation and device registration for device agents. Both controllers carry `[AllowAnonymous]`, so no authentication handler is consulted. `POST /api/agent/devices` proves itself instead, by validating the installer-key credentials carried in the request body. `GET /api/agent/updates/get-bundle-metadata/{runtime}` is open and returns download metadata for the packaged agent.

The ongoing agent connection is the AgentHub. It carries no credential at connect time. Device identity is proved per call, by an ED25519 signature over the payload that the server verifies against the device's stored key. Do not call these routes from an integration.

## Base URL

```
https://your-controlr-server/api/v1/devices
https://your-controlr-server/api/v1/tenants
https://your-controlr-server/api/agent/devices
```

## API Documentation

The easiest way to explore and test the API is through the **Scalar API Browser**:

1. Enable it by setting `ControlR_AppOptions__EnableScalarUi: true`. It is off in the shipped `appsettings.json`, and on in `appsettings.Development.json`.
2. Navigate to `https://your-server/scalar`. The two documents are also reachable as `https://your-server/scalar/v1` and `https://your-server/scalar/internal`.
3. Browse endpoints, view request/response schemas, and test calls interactively

The OpenAPI JSON is served from the same switch:

```
https://your-server/openapi/v1.json
https://your-server/openapi/internal.json
```

Both paths are registered only while `EnableScalarUi` is on. With the flag off, which is the production default, neither document is published and both paths return `404`. `v1.json` lists the `/api/v1/*` routes only. The `/api/*` and `/api/agent/*` routes are in `internal.json`.

A .NET typed API client is also published on NuGet as [`ControlR.ApiClient`](https://www.nuget.org/packages/ControlR.ApiClient/). The client uses a nested accessor pattern:

```csharp
// x-api-key or x-personal-token auth for the supported V1 surface
var device = await api.V1.Devices.GetDevice(deviceId, cancellationToken);

// Server-scoped service accounts sit under ServerServiceAccounts. There is no
// bare ServiceAccounts accessor.
var account = await api.V1.ServerServiceAccounts.Get(serviceAccountId, cancellationToken);
```

See [NuGet Packages](/docs/api-reference/nuget-packages) for setup.

## Authentication

Requests that reach a protected endpoint are authenticated. The server forwards every request to one handler, based on what the request carries. It tests in this order, and the first match wins:

1. A logon token, when the path starts with `/device-access` and the query contains `logonToken`.
2. A bearer token, and only when `ControlR_AppOptions__EnableInteractiveBearerLogin` is on.
3. The `x-personal-token` header.
4. The `x-api-key` header.
5. Otherwise the Identity application cookie.

| Method | Header or credential | Use case |
|---|---|---|
| Service account | `x-api-key: <credentialId>:<secret>` | S2S automation. Serves both server service accounts and tenant service accounts. |
| Personal Access Token | `x-personal-token: <token>` | Long-lived programmatic access. Acts as the owning user. |
| Interactive session | `.AspNetCore.Identity.Application` cookie | Browser-based web UI sessions. |
| Bearer Token | `Authorization: Bearer <token>` | Interactive clients and scripts. Accepted only when `EnableInteractiveBearerLogin` is on, which is off by default. |
| Logon Token | `?logonToken=<token>&deviceId=<id>` | Single-use device access links. |

Two consequences of that order are worth remembering. A request that sends both `x-personal-token` and `x-api-key` authenticates as the personal access token, because the personal-token header is tested first. A `Bearer` value in the `Authorization` header is ignored unless `EnableInteractiveBearerLogin` is on, and the request then falls through to cookie authentication.

A few routes answer without any credential. They are the reads that have to happen before an identity exists, such as the settings the sign-in page needs and the version and release-note lookups, plus agent registration, which proves itself with installer-key credentials inside the request body. [API Endpoints](/docs/api-reference/endpoints) carries an `Anonymous` marker on each one.

Logon tokens are not an API credential. The dynamic selector routes to the logon-token handler only for paths beginning with `/device-access`, and that handler requires a `deviceId` alongside the token. The same is true of a `?logonToken=` on an `/api/...` URL, which is never routed to that handler.

Neither the `x-api-key` value nor the `x-personal-token` value is the bare id. The id before the separator is produced by `Convert.ToHexString(id.ToByteArray())`, which is not the GUID with hyphens removed. Take the whole string from the server response that created the credential rather than assembling it. See [Authentication](/docs/api/authentication).

### Getting credentials for a new server

There is no unauthenticated API call that mints the first credential. Create the first server service account at startup by setting all three of `ControlR_Bootstrap__ServerServiceAccountName`, `ControlR_Bootstrap__ServerServiceAccountTokenId`, and `ControlR_Bootstrap__ServerServiceAccountTokenSecret`. All three must be set together or startup fails, and the secret must be at least 32 characters. The header value is then `{hex-guid}:{that secret}`, and creation is skipped on a later startup when the account already exists.

With that key in hand, create further accounts over `POST /api/v1/server-service-accounts` using the `x-api-key` header, or manage them from the service-account screens in the web UI. See [Service Accounts](/docs/api/service-accounts).

## Response Format

Successful responses return typed DTOs specific to each endpoint. Refer to the [OpenAPI specification](https://your-server/openapi/v1.json) or [Scalar API Browser](/docs/api/scalar-api-browser) for the full schema of each endpoint. The path is relative to your server origin. Substitute `your-server` with your real host.

## Error Handling

Errors use the [RFC 9457 Problem Details](https://datatracker.ietf.org/doc/html/rfc9457) format with content type `application/problem+json`. A global exception handler covers `/api` routes and requests that ask for JSON. A separate middleware fills in a Problem Details body for `/api` responses that reach the end of the pipeline with an error status and no body, such as an unmatched route or a missing credential.

Because there is no problem-type registry to point a caller at, every response the server writes carries `"type": "about:blank"` and a title keyed by status code. Read the status code rather than the title.

**Standard HTTP status codes:**

| Code | Title | Description |
|---|---|---|
| `400` | `Invalid request.` | Invalid input or validation error. A model-binding failure lists per-field errors under `errors`. A V1 action missing its `tenantId` explains itself in `detail`. |
| `401` | `Unauthorized.` | Missing or invalid authentication |
| `403` | `Forbidden.` | Authenticated but not authorized. Also the answer when a non-server principal names someone else's tenant. |
| `404` | `Not found.` | Resource does not exist |
| `429` | `Too many requests.` | Rate limited. Carries `Retry-After`. |
| `500` | `Internal server error.` | Unexpected server error. Carries `traceId`. |

**Example 500 error response:**

```json
{
  "type": "about:blank",
  "title": "Internal server error.",
  "status": 500,
  "detail": "An unexpected error occurred.",
  "traceId": "0HN6QO4CG7E8O:00000001"
}
```

The exception handler that writes that body is registered outside the development environment only. A development server returns its own developer exception page instead.

## SignalR Hubs

Real-time communication uses two SignalR hubs. Both register the MessagePack protocol first and JSON second, so a client negotiates whichever it supports.

| Hub | Path | Purpose |
|-----|------|---------|
| AgentHub | `/hubs/agent` | Agent device updates and telemetry |
| ViewerHub | `/hubs/viewer` | Viewer commands (remote control, terminal, files) |

The ViewerHub requires authentication. The AgentHub is mapped without an authorization requirement, and device identity is established per call by signature verification, as described under [Agent Routes](#agent-routes-apiagent).

## Rate Limiting

One rate-limit policy exists. It is a fixed window of 20 requests per minute per remote address and path, and a rejection returns `429 Too Many Requests` with a `Retry-After` header. Three endpoints carry it:

- `POST /api/auth/interactive-login`
- `POST /api/auth/change-password-with-credentials`
- `POST /api/auth/complete-password-reset`

Registration, the Identity API `login`, `forgotPassword`, and `refresh` endpoints, and every `/api/v1/*` route carry no limiter. Brute force against sign-in is handled by Identity account lockout rather than by rate limiting. There is no global limiter, so V1 calls are not throttled by the server.

## Next

- **[Authentication](/docs/api/authentication)**: Detailed authentication guide
- **[Scalar API Browser](/docs/api/scalar-api-browser)**: Interactive API exploration
- **[NuGet Packages](/docs/api-reference/nuget-packages)**: Typed client and viewer packages
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
