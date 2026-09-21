---
sidebar_position: 1
title: Authentication
---

## Authentication Overview

Every ControlR API request must be authenticated. The server routes each request through a [dynamic policy scheme](/docs/authentication-guide) that picks one of five handlers based on the request's headers and URL. This page documents the three machine-to-machine schemes used by API clients and automations: Personal Access Tokens, Service Account credentials, and Logon Tokens. For the cookie, bearer-token, and external-login flows, see the [Authentication Guide](/docs/authentication-guide).

## How a scheme is chosen

The selector tests the request in a fixed order, and the first match wins:

| Order | Condition | Handler |
|---|---|---|
| 1 | Path starts with `/device-access` and the query contains `logonToken` | Logon token |
| 2 | `Authorization: Bearer ...` header, and `EnableInteractiveBearerLogin` is on | Identity bearer token |
| 3 | Request contains an `x-personal-token` header | Personal access token |
| 4 | Request contains an `x-api-key` header | Service account credential |
| 5 | Anything else | Identity cookie |

Two consequences are worth remembering. A request that sends both `x-personal-token` and `x-api-key` authenticates as the **personal access token**, because that header is tested first. Bearer tokens are only recognized when the server runs with `ControlR_AppOptions__EnableInteractiveBearerLogin=true`, which is off by default.

## Authentication Methods

| Method | Header / parameter | Use case |
|---|---|---|
| Personal Access Token (PAT) | `x-personal-token: <tokenIdHex>:<secret>` | Long-lived per-user tokens for scripts and CI |
| Service Account credential | `x-api-key: <credentialIdHex>:<secret>` | Server-scoped, cross-tenant automation |
| Logon Token | `?logonToken=<token>&deviceId=<guid>` on `/device-access` | Single-use, per-device browser session |

Both token formats are `{hex-id}:{secret}`. See [How the id half is encoded](#how-the-id-half-is-encoded) before you build either string yourself.

## 1. Personal Access Tokens (PATs)

A PAT authenticates as the user who created it, with that user's effective permissions and tenant. Create tokens in the **Access Tokens** page at `/personal-access-tokens`, or through the API using the user's existing credentials.

**Token format:** `<tokenIdHex>:<secret>`. The server generates the secret itself as a URL-safe base64 string, and the full token is shown once at creation.

**Using a PAT:**

```bash
curl https://your-server/api/v1/devices \
  -H "x-personal-token: <tokenIdHex>:<secret>"
```

The list above is scoped to whatever the owning user may read. A PAT cannot reach outside that user's tenant.

PATs do **not** use the `Authorization` header. The dotnet API client sends them automatically when `ControlrApiClientOptions.PersonalAccessToken` is set.

**Rate limiting:** failed PAT authentication is counted on two **independent** axes, one per source IP address and one per token. Hitting either limit stops that axis until the window passes, and a success clears both counters. The limit is 5 attempts per 5-minute window and is hardcoded, so it is not configurable.

A throttled attempt is answered with `401 Unauthorized` like any other bad token. It does not return `429`, and no `Retry-After` header is sent. The counters live in the server process, so they reset on restart and are not shared between instances. Only a well-formed GUID parses into its own per-token counter. A malformed token-id prefix is folded into one shared key, so garbage token spam trips the per-IP limit instead of planting unbounded cache entries.

**Sample typed client call:**

```csharp
using ControlR.ApiClient;

ControlrApiClientBuilder.Initialize(options =>
{
    options.BaseUrl = new Uri("https://your-server");
    options.PersonalAccessToken = "<tokenIdHex>:<secret>";
});

var client = ControlrApiClientBuilder.GetClient();
await foreach (var device in client.V1.Devices.GetAllDevices(CancellationToken.None))
{
    Console.WriteLine($"{device.Name} ({device.Id})");
}
```

`GetClient()` throws `InvalidOperationException` unless `Initialize` ran first, so the call above is required, not decoration.

## 2. Service Account Credentials

Service accounts are non-interactive, server-scoped identities for S2S automation (RMM-style platforms, CI/CD, cross-tenant scripts). They authenticate via `x-api-key` and have no tenant context, so every tenant, user, and device ID must be explicit in each request.

**Token format:** `<credentialIdHex>:<secret>`.

**Using a service account:**

```bash
curl https://your-server/api/v1/server-service-accounts \
  -H "x-api-key: <credentialIdHex>:<secret>"
```

Note the plural `server-`. There is no `/api/v1/service-accounts` route. Credential management routes are nested under it, at `/api/v1/server-service-accounts/{serviceAccountId}/credentials`. Both forms are documented in [Service Accounts](/docs/api/service-accounts).

**Bootstrap:** create the first service account on startup with `ControlR_Bootstrap__ServerServiceAccountName`, `ControlR_Bootstrap__ServerServiceAccountTokenId`, and `ControlR_Bootstrap__ServerServiceAccountTokenSecret`. All three must be set together, or startup fails. The secret must be at least 32 characters. See [Service Accounts](/docs/api/service-accounts) for the full reference.

**Claims emitted:**

| Claim | Value |
|---|---|
| `controlr:principal:type` | `server-service-account` |
| `controlr:principal:id` | The service account's GUID |
| `controlr:auth:method` | `service-account-credential` |
| `controlr:credential:id` | The credential's GUID |
| `controlr:credential:type` | `ServiceAccountCredential` |

There is no `controlr:tenant:id` claim, because server-scoped service accounts are cross-tenant. A **tenant-scoped** service account authenticates through this same handler and does get `controlr:tenant:id`, with `controlr:principal:type` set to `tenant-service-account`.

**Rate limiting:** failed service-account authentication is counted on two **independent** axes, one per source IP address and one per credential. Defaults are 5 attempts per 5-minute window, configured via `ControlR_AppOptions__ServiceAccountAuthFailureLimit` and `ControlR_AppOptions__ServiceAccountAuthFailureWindowMinutes`. A throttled attempt returns `401`, not `429`.

## 3. Logon Tokens

Logon tokens grant browser access to a single device, scoped to either an existing user or a transient external user created on the fly. They are single-use, since validation consumes the token, and they expire. Both V1 routes default to 15 minutes and accept `expirationMinutes` from 1 to 1440.

| Kind | Route | Creator | Use case |
|---|---|---|---|
| User | `POST /api/v1/logon-tokens/user` | Any principal holding the device logon-token permission | Grant someone a browser session pinned to one device |
| External | `POST /api/v1/logon-tokens/external` | Service account, or a user in the same tenant | Open a browser session on behalf of a user in an external system |

**Create a user logon token:**

```bash
curl -X POST https://your-server/api/v1/logon-tokens/user \
  -H "x-personal-token: <tokenIdHex>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "<device-guid>",
    "tenantId": "<tenant-guid>",
    "userId": "<user-guid>"
  }'
```

**Create a service logon token:**

```bash
curl -X POST https://your-server/api/v1/logon-tokens/external \
  -H "x-api-key: <credentialIdHex>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "<tenant-guid>",
    "deviceId": "<device-guid>",
    "userCorrelationId": "ext-user-123"
  }'
```

Both answer `200 OK` with `deviceAccessUrl`, `expiresAt`, and `token`. The `deviceAccessUrl` points at `/device-access?deviceId={deviceId}&logonToken={token}`, which is the URL to hand to a browser.

The `deviceId` and `tenantId` pair must describe a device that really belongs to that tenant. A mismatch is answered with `400`. A caller that is not a server principal is additionally checked against its own tenant claim.

The external route's call creates or finds a transient user in the target tenant (`ext-{userCorrelationId}`, email `ext-{userCorrelationId}@controlr.local`) with no password, no permission assignments of its own, and access scoped to the specified device. Cleanup is automatic after `ControlR_AppOptions__ExternalUserCleanupAfterDays` days of inactivity (default 30). Setting that option below 1 disables cleanup.

The unversioned `POST /api/logon-tokens` route still exists but is deprecated in favor of `/api/v1/logon-tokens/user`. It takes only `deviceId` and derives tenant and user from the caller's claims, which means it needs a session carrying a tenant claim. A bearer token works only when `EnableInteractiveBearerLogin` is on.

## How the id half is encoded

In both the PAT and the `x-api-key` header, the id before the colon is produced by `Convert.ToHexString(id.ToByteArray())` and read back with `Convert.FromHexString`. That is **not** the GUID with hyphens removed, because `Guid.ToByteArray()` stores the first three groups little-endian.

```
guid  2a24478c-a43a-4d3b-a95a-350f496ce268
hyphen-stripped   2A24478CA43A4D3BA95A350F496CE268   (wrong, do not send this)
actual id hex     8C47242A3AA43B4DA95A350F496CE268   (what the server expects)
```

Take the string from a server response instead of computing it. Creating a credential or a PAT returns a value that already contains the encoded id, and that value is the complete header. The server emits uppercase hex but accepts any case. GUIDs whose first three groups are palindromic look identical in both forms, which is why a hand-derived value can appear correct and then fail against a real server.

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Invalid request (missing or invalid fields, malformed token format) |
| `401` | Missing, invalid, expired, revoked, or throttled credentials |
| `403` | Authenticated but not authorized (missing permission, disabled account, tenant mismatch) |
| `404` | Target resource not found, or hidden because the caller may not see it |

`429` does appear from ControlR, but not from these schemes. The only rate limiter that returns it, and the only one that sets `Retry-After`, is attached to the anonymous sign-in endpoints under `/api/auth`. Credential failures are throttled in the authentication handler and answered with `401`.

Authentication errors on `/api/*` return an `application/problem+json` body, including the ones the pipeline produces before a controller runs. See [API Overview](/docs/api/overview#error-handling) for the schema.

## Next

- **[API Overview](/docs/api/overview)**: REST API structure and conventions
- **[Service Accounts](/docs/api/service-accounts)**: Bootstrap, credential management, logon tokens in depth
- **[Authentication Guide](/docs/authentication-guide)**: Interactive flows, 2FA, passkeys, external providers
