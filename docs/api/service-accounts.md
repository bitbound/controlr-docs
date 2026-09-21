---
sidebar_position: 2
title: Service Accounts
---

## Overview

Service accounts are non-interactive identities designed for **system-to-system (S2S) automation**. They allow external systems (RMM platforms, automation scripts, CI/CD pipelines) to interact with the ControlR API without a user password. Service accounts authenticate using an API key (`x-api-key` header).

This page documents **server-scoped** service accounts. ControlR also has tenant-scoped service accounts, which live under `/api/v1/tenant-service-accounts/{tenantId}` and carry a tenant claim. Server-scoped accounts have no tenant claim and reach across tenants.

## Service Accounts vs User Accounts

| | User Account | Server Service Account |
|---|---|---|
| **Scope** | Single tenant | Server-wide (cross-tenant) |
| **Auth method** | Password, passkey, PAT, external OAuth | `x-api-key` header |
| **Permissions** | Tenant-scoped permission assignments | Server-scoped permission assignments, or an unconditional bypass. See [Access modes](#access-modes). |
| **Tenant context** | Derived from session claims | None. Must be explicit in each request |
| **Created by** | Self-registration, invite, admin | Bootstrap config or V1 API |

## Access modes

Every server-scoped account carries an `accessMode`, set at creation and never inferred:

| Mode | Behaviour |
|---|---|
| `Unrestricted` | Bypasses permission evaluation entirely. Reads and writes every tenant. |
| `Restricted` | Evaluates its own assignment rows normally. Zero assignments means every call is denied. |

The bootstrapped account is always created `Unrestricted`. Creating an `Unrestricted` account through the API additionally requires the `server.permissions.write` permission.

A `Restricted` account has no tenant claim either. Its reach comes from assignment rows scoped to tenants, customers, device groups, or devices, so it can still be cross-tenant.

## Bootstrapping a Service Account

A server-scoped service account can be created on first startup by providing bootstrap configuration:

```yaml
# docker-compose.yml environment
ControlR_Bootstrap__ServerServiceAccountName: "my-automation"
ControlR_Bootstrap__ServerServiceAccountDescription: "Server-scoped automation account"
ControlR_Bootstrap__ServerServiceAccountId: "11111111-2222-3333-4444-777777777777"
ControlR_Bootstrap__ServerServiceAccountTokenId: "11111111-2222-3333-4444-666666666666"
ControlR_Bootstrap__ServerServiceAccountTokenSecret: "replace-this-with-a-secret-of-at-least-32-chars"
```

**Configuration rules:**
- `ServerServiceAccountName`, `ServerServiceAccountTokenId`, and `ServerServiceAccountTokenSecret` must all be set together
- `ServerServiceAccountId` and `ServerServiceAccountDescription` are optional
- `ServerServiceAccountTokenId` is the id of the account's first credential, named `Bootstrap Credential`
- `ServerServiceAccountTokenSecret` must be at least 32 characters
- If an account with that name already exists, bootstrap is skipped (idempotent). The check is by name, not by id.
- Partial configuration causes startup to fail with an error
- The secret is never logged

**The resulting x-api-key:**

```
x-api-key: 11111111222233334444666666666666:replace-this-with-a-secret-of-at-least-32-chars
```

The format is `{credential-id-hex}:{plaintext-secret}`. See [How the credential id is encoded](#how-the-credential-id-is-encoded) for how that hex string is derived. This particular example is one of the few GUIDs where the hex string happens to look like the GUID with hyphens removed.

### Service-Account-Only Deployments

To run a ControlR server that is driven entirely via API with no self-registration:

```yaml
ControlR_AppOptions__EnablePublicRegistration: false
ControlR_AppOptions__DisableFirstUserSelfRegistration: true
```

Combine with service account bootstrap above. No browser-based user registration is possible.

## How the credential id is encoded

The hex half of the `x-api-key` is **not** the GUID with its hyphens removed. The server produces it with `Convert.ToHexString(credentialId.ToByteArray())` and reads it back with `Convert.FromHexString`.

`Guid.ToByteArray()` is not the same byte order as the textual GUID. The first three groups are stored little-endian:

```
guid  2a24478c-a43a-4d3b-a95a-350f496ce268
hyphen-stripped   2A24478CA43A4D3BA95A350F496CE268   (wrong, do not send this)
actual hex id     8C47242A3AA43B4DA95A350F496CE268   (what the server expects)
```

Only the first three groups are rearranged. The last two-byte group and the final eight bytes keep their textual order.

Two consequences worth knowing:

- Do not compute the hex string yourself. Take it from a server response. Creating a credential returns a value that already contains it, and the bootstrap path gives you the credential GUID directly.
- The server emits uppercase hex but accepts any case on the way in.

GUIDs whose first three groups are palindromic, such as `11111111-2222-3333-4444-666666666666`, are identical in both forms. That coincidence is what makes a hand-derived key fail only in production.

## Authentication

Service accounts authenticate via the `x-api-key` HTTP header:

```bash
curl https://your-server/api/v1/server-service-accounts \
  -H "x-api-key: <credential-id-hex>:<secret>"
```

This lists every server-scoped account, so it requires the `server.service-accounts.read` permission unless the account is `Unrestricted`.

Requests carrying `x-api-key` are routed to the service-account handler by a dynamic scheme selector. A request that carries both `x-api-key` and `x-personal-token` authenticates as the personal access token, because the PAT header is checked first.

On successful authentication, the following claims are emitted:

| Claim | Value |
|-------|-------|
| `controlr:principal:type` | `server-service-account` |
| `controlr:principal:id` | Service account entity GUID |
| `controlr:auth:method` | `service-account-credential` |
| `controlr:credential:id` | Credential entity GUID |
| `controlr:credential:type` | `ServiceAccountCredential` |

A server-scoped account emits no `controlr:tenant:id` claim. The handler does emit that claim for a **tenant-scoped** account, whose `controlr:principal:type` is then `tenant-service-account`. If the account has a description, it is also emitted as the standard `ClaimTypes.Name`.

The service account **is not** scoped to any tenant. All tenant, user, and device identifiers must be provided explicitly in each request.

### Rate Limiting

Failed authentication attempts are counted on two **independent** axes, not on a combined key:

- Per source IP address
- Per credential id

Hitting either limit stops that credential, or that address, from authenticating until the window passes. A successful authentication clears both counters.

| Setting | Default |
|---------|---------|
| `ControlR_AppOptions__ServiceAccountAuthFailureLimit` | 5 attempts |
| `ControlR_AppOptions__ServiceAccountAuthFailureWindowMinutes` | 5 minutes |

A throttled attempt is answered with `401 Unauthorized`, like any other failed credential. It does not return `429`, and no `Retry-After` header is sent. Treat a 401 that keeps repeating after a correct secret as throttling and back off.

The counters live in the server process, so they reset on restart and are not shared between instances.

## Managing Credentials

Each service account can have multiple credentials. Credentials can be created, used independently, and revoked separately. The required permission depends on the verb: reads need `server.service-accounts.read`, creating, updating, and deleting an account need `server.service-accounts.write`, and anything touching a credential needs `server.service-accounts.rotate-credentials`. An `Unrestricted` account bypasses all three.

| Method | Path | Success |
|---|---|---|
| `GET` | `/api/v1/server-service-accounts` | `200` with `{ "items": [...] }` |
| `GET` | `/api/v1/server-service-accounts/{serviceAccountId}` | `200` |
| `POST` | `/api/v1/server-service-accounts` | `201` |
| `PUT` | `/api/v1/server-service-accounts/{serviceAccountId}` | `200` |
| `DELETE` | `/api/v1/server-service-accounts/{serviceAccountId}` | `204` |
| `POST` | `/api/v1/server-service-accounts/{serviceAccountId}/credentials` | `200` |
| `DELETE` | `/api/v1/server-service-accounts/{serviceAccountId}/credentials/{credentialId}` | `204` |
| `DELETE` | `/api/v1/server-service-accounts/{serviceAccountId}/credentials/{credentialId}/purge` | `204` |

Both ids in a path are GUIDs in the usual hyphenated form, not the hex form used in `x-api-key`.

### Creating a Credential

The request body is required. `name` is mandatory and between 1 and 100 characters. `expiresAt` is optional, and omitting it creates a credential that never expires.

```bash
curl -X POST "https://your-server/api/v1/server-service-accounts/11111111-2222-3333-4444-777777777777/credentials" \
  -H "x-api-key: <credential-id-hex>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ci-runner",
    "expiresAt": "2027-01-01T00:00:00Z"
  }'
```

**Response (200 OK):**

```json
{
  "credential": {
    "id": "2a24478c-a43a-4d3b-a95a-350f496ce268",
    "name": "ci-runner",
    "createdAt": "2026-07-16T12:00:00Z",
    "expiresAt": "2027-01-01T00:00:00Z",
    "revokedAt": null,
    "lastUsedAt": null
  },
  "plainTextSecretKey": "8C47242A3AA43B4DA95A350F496CE268:8vN2rZqTm1YcP0sE6dKfJWjXhLgUoAyB9uI3tC5vBnQ7eR4kM2xZ8sD1fG6hJ0wL"
}
```

The response is the account's new credential wrapped in `credential`, plus one flat string named `plainTextSecretKey`.

`plainTextSecretKey` is despite its name the **complete** `x-api-key` value, hex id and secret joined by a colon. Use it verbatim as the header value. Do not send only the part after the colon, and do not derive the hex half from `credential.id` yourself.

That string is returned **exactly once**, at creation time. The secret is stored hashed and cannot be retrieved again. Losing it means issuing a new credential.

An `expiresAt` in the past is rejected with `400`. A credential on a disabled account is refused with `403`.

### Revoking a Credential

```bash
curl -X DELETE "https://your-server/api/v1/server-service-accounts/{serviceAccountId}/credentials/{credentialId}" \
  -H "x-api-key: <credential-id-hex>:<secret>"
```

Returns `204 No Content`. Once revoked, the credential can no longer authenticate. Revoking an already-revoked credential is idempotent and also returns `204`. The credential row is kept, so it still appears in the account's `credentials` list with `revokedAt` set.

### Purging a Credential

Revocation leaves the row behind. To delete it permanently:

```bash
curl -X DELETE "https://your-server/api/v1/server-service-accounts/{serviceAccountId}/credentials/{credentialId}/purge" \
  -H "x-api-key: <credential-id-hex>:<secret>"
```

Returns `204 No Content`. Only credentials that are already revoked or already expired can be purged. An active credential returns `400` with the message `Only revoked or expired credentials can be deleted. Revoke the credential first.` Purge is not idempotent in the way revoke is. Once the row is gone, a second call returns `404`.

## Server Service Account Objects

`GET /api/v1/server-service-accounts/{serviceAccountId}`, the `POST` that creates an account, and the `PUT` that updates one all return this object. The collection `GET` wraps it in `{ "items": [...] }`.

```json
{
  "id": "11111111-2222-3333-4444-777777777777",
  "name": "my-automation",
  "description": "Server-scoped automation account",
  "isEnabled": true,
  "accessMode": "Unrestricted",
  "createdAt": "2026-07-16T12:00:00Z",
  "credentials": [
    {
      "id": "2a24478c-a43a-4d3b-a95a-350f496ce268",
      "name": "Bootstrap Credential",
      "createdAt": "2026-07-16T12:00:00Z",
      "expiresAt": null,
      "revokedAt": null,
      "lastUsedAt": "2026-07-16T12:05:00Z"
    }
  ]
}
```

`accessMode` serializes as the string `Unrestricted` or `Restricted`. `credentials` is ordered by creation time. Credential metadata never includes the secret.

`POST /api/v1/server-service-accounts` takes `{ "name": "...", "description": "...", "accessMode": "Restricted" }`. Both `name` (1 to 100 characters) and `accessMode` are required, and the access mode is never inferred from the presence of assignment rows. A duplicate name returns `409`. The new account has no credentials, so call the credentials route next to get a usable `x-api-key`.

`PUT /api/v1/server-service-accounts/{serviceAccountId}` takes `{ "name": "...", "description": "...", "isEnabled": true }`. `name` is required and `accessMode` cannot be changed through this route.

## Creating Service Logon Tokens

Service accounts use logon tokens to grant browser sessions on behalf of users in external systems. This is the building block for RMM-style "connect to this device" buttons driven by an external backend.

```bash
curl -X POST https://your-server/api/v1/logon-tokens/external \
  -H "x-api-key: <credential-id-hex>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "<tenant-guid>",
    "deviceId": "<device-guid>",
    "userCorrelationId": "ext-user-123"
  }'
```

`tenantId` and `deviceId` must refer to a device that actually belongs to that tenant, otherwise the call answers `400`. Optional fields are `userDisplayName`, `sessionCorrelationId`, `expirationMinutes` (1 to 1440, default 15), `permissions`, and `allowedDesktopSessionIds`.

The endpoint finds or creates a **transient user** in the target tenant:

- Username: `ext-{userCorrelationId}`
- Email: `ext-{userCorrelationId}@controlr.local`
- No password set (cannot be logged into directly)
- No permission assignments of its own
- Scoped to the requested device

ControlR issues a single-use logon token that, when opened in a browser, signs the transient user in and lands directly on the device's access page. The response is `200 OK` with `deviceAccessUrl`, `expiresAt`, and `token`. The `deviceAccessUrl` is `/device-access?deviceId={deviceId}&logonToken={token}`.

A call for a `userCorrelationId` that collides with a non-external account in that tenant is rejected with `400`.

Transient users are cleaned up by the external user cleanup background service after `ControlR_AppOptions__ExternalUserCleanupAfterDays` of inactivity (default 30). Setting that option below 1 disables cleanup.

## Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Invalid request. Missing credential name, `expiresAt` in the past, malformed `x-api-key` format, purging an active credential. |
| `401` | Invalid, missing, or throttled `x-api-key` |
| `403` | Authenticated but not authorized. The caller lacks the required permission, or the target account is disabled. |
| `404` | Service account or credential not found |
| `409` | A server service account with that name already exists |

`403` is not limited to non-service-account callers. A user principal holding `server.service-accounts.write` can call these routes, and a `Restricted` service account with no assignment rows is denied everything.

## Cross-Tenant Operations

Server-scoped service accounts are not bound to any tenant. Endpoints that operate inside a tenant take an explicit tenant id, and the server trusts it for a server principal.

```bash
# Create an installer key for a specific tenant
curl -X POST https://your-server/api/v1/installer-keys \
  -H "x-api-key: <credential-id-hex>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "<tenant-guid>",
    "keyType": 1,
    "friendlyName": "Field laptops",
    "allowedUses": 25
  }'
```

`tenantId` and `keyType` are required. `friendlyName`, `allowedUses`, and `expiration` are optional. There is no `keyName` field. The response is `200 OK` and includes `keySecret`, which is only returned at creation. The same controller's `GET`, `PUT`, and `DELETE` routes take `tenantId` as a **query** parameter instead.

`keyType` is sent as a **number**, not a name:

| Value | Meaning |
|---|---|
| `1` | Usage-based. Capped by `allowedUses`. The server overwrites any `expiration` you send with 24 hours from creation. |
| `2` | Time-based. Valid until `expiration`, so `expiration` is required in practice. |
| `3` | Persistent. Never expires. |

`0` is `Unknown` and is not a usable key type. Unlike `accessMode` on a service account, `keyType` has no string form on the wire, so `"keyType": "UsageBased"` is rejected.

### Device listing is not tenant-filterable

`GET /api/v1/devices` has no `tenantId` parameter. A `?tenantId=` you append is not bound to anything and is silently ignored, so do not rely on it.

```bash
# Returns every device the caller may read, regardless of the tenantId below
curl "https://your-server/api/v1/devices?tenantId=<tenant-guid>" \
  -H "x-api-key: <credential-id-hex>:<secret>"
```

The result set is derived only from the caller's access scope. An `Unrestricted` account gets every device on the server, across all tenants. A `Restricted` account gets the tenants, customers, device groups, and devices its assignments grant. `GET /api/v1/devices/summary` behaves the same way.

Filter by tenant client-side, using the `tenantId` on each returned device, or narrow the account's assignments so the scope itself is the boundary you want.

## Next

- **[API Endpoints](/docs/api-reference/endpoints)**: Complete V1 and Internal endpoint reference
- **[Authentication Guide](/docs/authentication-guide)**: All authentication schemes
- **[Configuration](/docs/configuration)**: Bootstrap and AppOptions reference
