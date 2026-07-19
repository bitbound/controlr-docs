---
sidebar_position: 2
title: Service Accounts
---

## Overview

Service accounts are server-scoped identities designed for **system-to-system (S2S) automation**. They allow external systems (RMM platforms, automation scripts, CI/CD pipelines) to interact with the ControlR API without a user password. Service accounts authenticate using an API key (`x-api-key` header) and have cross-tenant access.

## Service Accounts vs User Accounts

| | User Account | Service Account |
|---|---|---|
| **Scope** | Single tenant | Server-wide (cross-tenant) |
| **Auth method** | Password, passkey, PAT, external OAuth | `x-api-key` header |
| **Roles** | Tenant-level roles | No roles; explicit identifiers in requests |
| **Tenant context** | Derived from session claims | None; must be explicit in each request |
| **Created by** | Self-registration, invite, admin | Bootstrap config or V1 API |

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
- `ServerServiceAccountTokenSecret` must be at least 32 characters
- If the named account already exists, bootstrap is skipped (idempotent)
- Partial configuration causes startup to fail with an error
- The secret is never logged

**The resulting x-api-key:**

```
x-api-key: 11111111222233334444666666666666:replace-this-with-a-secret-of-at-least-32-chars
```

The format is `{credential-id-hex}:{plaintext-secret}`, where the credential ID is stripped of hyphens.

### Service-Account-Only Deployments

To run a ControlR server that is driven entirely via API with no self-registration:

```yaml
ControlR_AppOptions__EnablePublicRegistration: false
ControlR_AppOptions__DisableFirstUserSelfRegistration: true
```

Combine with service account bootstrap above. No browser-based user registration is possible.

## Authentication

Service accounts authenticate via the `x-api-key` HTTP header:

```bash
curl https://your-server/api/v1/service-accounts \
  -H "x-api-key: <credential-id>:<secret>"
```

On successful authentication, the following claims are emitted:

| Claim | Value |
|-------|-------|
| `controlr:principal:type` | `server-service-account` |
| `controlr:principal:id` | Service account entity GUID |
| `controlr:auth:method` | `service-account-credential` |
| `controlr:credential:id` | Credential entity GUID |

No `controlr:tenant:id` claim is emitted. The service account **is not** scoped to any tenant. All tenant, user, and device identifiers must be provided explicitly in each request.

### Rate Limiting

Failed authentication attempts are rate-limited per IP + credential-ID prefix:

| Setting | Default |
|---------|---------|
| `ControlR_AppOptions__ServiceAccountAuthFailureLimit` | 5 attempts |
| `ControlR_AppOptions__ServiceAccountAuthFailureWindowMinutes` | 5 minutes |

Exceeded limits return `429 Too Many Requests`.

## Managing Credentials

Each service account can have multiple credentials. Credentials can be created, used independently, and revoked separately.

### Creating a Credential

```bash
curl -X POST https://your-server/api/v1/service-accounts/{id}/credentials \
  -H "x-api-key: <credential-id>:<secret>"
```

**Response (201 Created):**

```json
{
  "id": "88888888-4444-4444-4444-999999999999",
  "credentialId": "88888888444444444444999999999999",
  "secret": "newly-generated-secret-value",
  "createdAt": "2026-07-16T12:00:00Z"
}
```

The secret is returned **exactly once**. Store it securely; it cannot be retrieved again.

### Revoking a Credential

```bash
curl -X DELETE https://your-server/api/v1/service-accounts/{id}/credentials/{credentialId} \
  -H "x-api-key: <credential-id>:<secret>"
```

Returns `204 No Content`. Once revoked, the credential can no longer authenticate.

## Creating Service Logon Tokens

Service accounts use logon tokens to grant browser sessions on behalf of users in external systems. This is the building block for RMM-style "connect to this device" buttons driven by an external backend.

```bash
curl -X POST https://your-server/api/v1/logon-tokens/external \
  -H "x-api-key: <credential-id>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "<tenant-guid>",
    "deviceId": "<device-guid>",
    "userCorrelationId": "ext-user-123"
  }'
```

The endpoint finds or creates a **transient user** in the target tenant:

- Username: `ext-{userCorrelationId}`
- Email: `ext-{userCorrelationId}@controlr.local`
- No password set (cannot be logged into directly)
- No roles or tags
- Scoped to the requested device

ControlR issues a single-use logon token that, when opened in a browser, signs the transient user in and lands directly on the device's access page.

Transient users are cleaned up by the external user cleanup background service after `ControlR_AppOptions__ExternalUserCleanupAfterDays` of inactivity (default 30).

## Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Invalid request (e.g., missing required fields) |
| `401` | Invalid or missing `x-api-key` |
| `403` | Authenticated but not a service account or server admin |
| `404` | Service account or credential not found |
| `409` | Conflict (e.g., creating a credential for a disabled account) |
| `429` | Rate limit exceeded |

## Cross-Tenant Operations

Server-scoped service accounts are not bound to any tenant. When calling V1 endpoints, provide the tenant ID explicitly:

```bash
# List devices in a specific tenant
curl "https://your-server/api/v1/devices?tenantId=<tenant-guid>" \
  -H "x-api-key: <credential-id>:<secret>"

# Create an installer key for a specific tenant
curl -X POST https://your-server/api/v1/installer-keys \
  -H "x-api-key: <credential-id>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"<tenant-guid>","keyName":"my-key"}'
```

## Next

- **[API Endpoints](/docs/api-reference/endpoints)**: Complete V1 and Internal endpoint reference
- **[Authentication Guide](/docs/authentication-guide)**: All authentication schemes
- **[Configuration](/docs/configuration)**: Bootstrap and AppOptions reference
