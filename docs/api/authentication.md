---
sidebar_position: 1
title: Authentication
---

## Authentication Overview

Every ControlR API request must be authenticated. The server routes each request through a [dynamic policy scheme](/docs/authentication-guide) that picks one of five handlers based on the request's headers and URL. This page documents the three machine-to-machine schemes used by API clients and automations: Personal Access Tokens, Service Account credentials, and Logon Tokens. For the cookie, bearer-token, and external-login flows, see the [Authentication Guide](/docs/authentication-guide).

## Authentication Methods

| Method | Header / parameter | Use case |
|---|---|---|
| Personal Access Token (PAT) | `x-personal-token: <tokenId>:<secret>` | Long-lived per-user tokens for scripts and CI |
| Service Account credential | `x-api-key: <credentialId>:<secret>` | Server-scoped, cross-tenant automation |
| Logon Token | `?logonToken=<token>&deviceId=<guid>` on `/device-access` | Single-use, per-device browser session |

## 1. Personal Access Tokens (PATs)

A PAT authenticates as the user who created it, with the user's roles, tenant, and tag-based device access. Create tokens in the **Access Tokens** page at `/personal-access-tokens`, or in the API with the user's existing credentials.

**Token format:** `<tokenId>:<secret>` (hex GUID for the token ID, plaintext secret).

**Using a PAT:**

```bash
curl https://your-server/api/v0/devices \
  -H "x-personal-token: <tokenId>:<secret>"
```

PATs do **not** use the `Authorization` header. The dotnet API client sends them automatically when `ControlrApiClientOptions.PersonalAccessToken` is set.

**Rate limiting:** failed PAT authentication is rate-limited to 5 attempts per 5-minute window per token-prefix + source IP. After the limit is hit, requests return `429 Too Many Requests`.

**Sample typed client call:**

```csharp
using ControlR.ApiClient;

var client = ControlrApiClientBuilder.GetClient();
await foreach (var device in client.V0.Devices.GetAllDevices(cancellationToken))
{
    Console.WriteLine($"{device.Name} ({device.Id})");
}
```

## 2. Service Account Credentials

Service accounts are non-interactive, server-scoped identities for S2S automation (RMM-style platforms, CI/CD, cross-tenant scripts). They authenticate via `x-api-key` and have no tenant context, so every tenant, user, and device ID must be explicit in each request.

**Token format:** `<credentialId>:<secret>` (hex GUID + plaintext secret).

**Using a service account:**

```bash
curl https://your-server/api/v0/service-accounts \
  -H "x-api-key: <credentialId>:<secret>"
```

**Bootstrap:** create the first service account on startup with `Bootstrap__ServerServiceAccountName`, `Bootstrap__ServerServiceAccountTokenId`, and `Bootstrap__ServerServiceAccountTokenSecret`. All three must be set together, or startup fails. The secret must be at least 32 characters. See [Service Accounts](/docs/api/service-accounts) for the full reference.

**Claims emitted:**

| Claim | Value |
|---|---|
| `controlr:principal:type` | `server-service-account` |
| `controlr:principal:id` | The service account's GUID |
| `controlr:auth:method` | `service-account-credential` |
| `controlr:credential:id` | The credential's GUID |

There is no `controlr:tenant:id` claim, because server-scoped service accounts are cross-tenant.

**Rate limiting:** failed service-account authentication is rate-limited per IP + credential-prefix. Defaults are 5 attempts per 5-minute window; configure via `ControlR_AppOptions__ServiceAccountAuthFailureLimit` and `ControlR_AppOptions__ServiceAccountAuthFailureWindowMinutes`.

## 3. Logon Tokens

Logon tokens grant browser access to a single device, scoped to either an existing user or a transient external user created on the fly. They are single-use and time-limited.

| Kind | Creator | Use case |
|---|---|---|
| User | Any authenticated user | Grant someone a browser session pinned to one device |
| Service | Service account | Open a browser session on behalf of a user in an external system |

**Create a user logon token (Internal API):**

```bash
curl -X POST https://your-server/api/internal/logon-tokens \
  -H "Authorization: Bearer <bearer-token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"<device-guid>"}'
```

The response contains a URL like `https://your-server/device-access?logonToken=<token>&deviceId=<guid>` that can be opened in a browser.

**Create a service logon token (V0 API):**

```bash
curl -X POST https://your-server/api/v0/logon-tokens/external \
  -H "x-api-key: <credentialId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "<tenant-guid>",
    "deviceId": "<device-guid>",
    "userCorrelationId": "ext-user-123"
  }'
```

The service account's call creates or finds a transient user in the target tenant (`ext-{userCorrelationId}`) with no password, no roles, no tags, and access scoped to the specified device. The returned URL opens a browser session on that user's behalf. Cleanup is automatic after `ControlR_AppOptions__ExternalUserCleanupAfterDays` days of inactivity (default 30).

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Invalid request (missing/invalid fields) |
| `401` | Missing or invalid credentials |
| `403` | Authenticated but not authorized (wrong scheme, missing role, denied device access) |
| `429` | Rate limit exceeded (check the `Retry-After` header) |
| `503` | Service unavailable (typically the upstream identity store) |

Authentication errors on `/api/*` responses return an `application/problem+json` body. See [API Overview](/docs/api/overview#error-handling) for the schema.

## Next

- **[API Overview](/docs/api/overview)**: REST API structure and conventions
- **[Service Accounts](/docs/api/service-accounts)**: Bootstrap, credential management, logon tokens in depth
- **[Authentication Guide](/docs/authentication-guide)**: Interactive flows, 2FA, passkeys, external providers
