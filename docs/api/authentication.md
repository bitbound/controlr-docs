---
sidebar_position: 1
title: Authentication
---

## Authentication Overview

ControlR uses a multi-scheme authentication pipeline that routes requests to the appropriate handler based on the request type. There are **five authentication schemes**:

1. **Cookie-based authentication**: Default for the web UI (Blazor WASM)
2. **Bearer token authentication**: For interactive login via API (desktop clients, scripts)
3. **Personal Access Token (PAT)**: For long-lived programmatic access
4. **Service Account Credential**: For S2S automation and cross-tenant management
5. **Logon Token**: For single-use device access URLs

## Dynamic Authentication Scheme

ControlR uses a policy scheme that automatically selects the right handler:

- Requests with `x-api-key` header → Service Account handler
- Requests to `/device-access` with a `logonToken` query parameter → Logon Token handler
- Requests with `Authorization: Bearer <token>` → Bearer Token handler
- Requests with `x-personal-token` header → PAT handler
- Everything else → Cookie-based authentication

## 1. Cookie-Based Authentication (Web UI)

This is the default authentication method for the web interface. Users log in through the login page and receive an authentication cookie.

**Login flow:**
1. Navigate to the ControlR web interface
2. Enter username and password
3. If 2FA is enabled, enter the TOTP code
4. If passkey is configured, complete the passkey authentication
5. An authentication cookie is set for the session

**Logout:**
- Use the logout button in the web interface
- Or POST to `/api/auth/logout`

## 2. Bearer Token Authentication (Interactive Login)

Bearer tokens are useful for desktop clients, CLI tools, or any scenario where cookies aren't practical.

**Prerequisites:** The server must have `ControlR_AppOptions__EnableInteractiveBearerLogin` set to `true`.

**Obtaining a token:**

```bash
curl -X POST https://your-server/api/auth/interactive-login \
  -H "Content-Type: application/json" \
  -d '{"userName":"user@example.com","password":"your-password","twoFactorCode":"123456"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt-bearer-token>",
    "refreshToken": "<refresh-token>",
    "expiresIn": 3600
  }
}
```

**Token lifetimes** (configurable):
| Setting | Default | Description |
|---------|---------|-------------|
| `ControlR_AppOptions__InteractiveBearerTokenExpirationMinutes` | `60` | Access token lifetime |
| `ControlR_AppOptions__InteractiveRefreshTokenExpirationDays` | `30` | Refresh token lifetime |

**Refreshing tokens:**
```bash
curl -X POST https://your-server/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'
```

**Using the token:**
```bash
curl https://your-server/api/devices \
  -H "Authorization: Bearer <token>"
```

## 3. Personal Access Tokens (PATs)

Personal Access Tokens provide long-lived programmatic access without needing a username/password. They're created through the web UI or API.

**Creating a PAT:**
1. Navigate to **Access Tokens** in the web interface (`/personal-access-tokens`)
2. Enter a friendly name
3. Click **Create PAT**
4. Copy and store the token. It will **never be shown again**.

**Using a PAT:**
```bash
curl https://your-server/api/devices \
  -H "x-personal-token: <tokenId>:<secret>"
```

The token format is `{tokenId}:{secret}`. It's sent via the `x-personal-token` header (not `Authorization`).

**Rate limiting:** PAT authentication failures are rate-limited to 5 attempts per 5 minutes per token prefix + IP.

## 4. Service Account Credential Authentication (x-api-key)

Service accounts are server-scoped or tenant-scoped identities designed for system-to-system (S2S) automation. They authenticate using an API key rather than a user password.

**Bootstrap a service account** (on first startup):

```yaml
ControlR_Bootstrap__ServerServiceAccountName: "my-automation"
ControlR_Bootstrap__ServerServiceAccountTokenId: "11111111-2222-3333-4444-555555555555"
ControlR_Bootstrap__ServerServiceAccountTokenSecret: "a-very-strong-and-long-secret"
```

**Using the x-api-key:**

```bash
curl https://your-server/api/v0/service-accounts \
  -H "x-api-key: 11111111222233334444555555555555:a-very-strong-and-long-secret"
```

The token format is `{credential-id-hex}:{plaintext-secret}`, sent via the `x-api-key` header.

**Claims emitted on successful auth:**

| Claim | Value |
|-------|-------|
| `controlr:principal:type` | `server-service-account` |
| `controlr:principal:id` | Service account GUID |
| `controlr:auth:method` | `service-account-credential` |
| `controlr:credential:id` | Credential GUID |

No `controlr:tenant:id` claim is emitted. Server-scoped service accounts are cross-tenant; all identifiers must be explicit in the request.

**Rate limiting:** Service account authentication failures are rate-limited per IP + credential-ID prefix. Configurable via `ControlR_AppOptions__ServiceAccountAuthFailureLimit` (default 5) and `ControlR_AppOptions__ServiceAccountAuthFailureWindowMinutes` (default 5).

**Service-account-only deployments:** To run ControlR in a headless/API-only mode with no self-registration:

```yaml
ControlR_AppOptions__EnablePublicRegistration: false
ControlR_AppOptions__DisableFirstUserSelfRegistration: true
# + bootstrap server service account configuration above
```

**Managing credentials:** Additional credentials can be created and revoked via `POST /api/v0/service-accounts/{id}/credentials` and `DELETE /api/v0/service-accounts/{id}/credentials/{credentialId}`. Each credential's secret is returned exactly once on creation.

## 5. Logon Tokens

Logon Tokens are time-limited, single-use tokens that grant access to a **specific device**. They come in two kinds:

| Kind | Creator | Use Case |
|------|---------|----------|
| **User** | Any authenticated user | Granting a user browser session for a specific device |
| **Service** | Service account | Creating a temporary browser session linked to an external system identity |

**Creating a user logon token (Internal API):**

```bash
curl -X POST https://your-server/api/internal/logon-tokens \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"<device-guid>"}'
```

**Creating a service logon token (V0 API):**

```bash
curl -X POST https://your-server/api/v0/logon-tokens/external \
  -H "x-api-key: <credential-id>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "<tenant-guid>",
    "deviceId": "<device-guid>",
    "userCorrelationId": "ext-user-123"
  }'
```

Service logon tokens find-or-create a **transient user** (`ext-{correlationId}`) in the target tenant. These users have no password (unloggable), no real email, and no roles or tags. They are scoped to a single device.

## External Authentication

ControlR supports external login providers:

| Provider | Configuration |
|----------|--------------|
| **Microsoft Account** | Set `ControlR_AppOptions__MicrosoftClientId` and `ControlR_AppOptions__MicrosoftClientSecret` |
| **GitHub OAuth** | Set `ControlR_AppOptions__GitHubClientId` and `ControlR_AppOptions__GitHubClientSecret` |

External providers require both a Client ID and Client Secret to be configured. They appear as login options on the login page.

## Two-Factor Authentication (2FA)

Users can enable TOTP-based 2FA through their account settings. The authenticator app name is controlled by `ControlR_AppOptions__AuthenticatorIssuerName` (default: "ControlR").

## Passkey Authentication

Passkeys provide passwordless authentication. When enabled, users can sign in using their device's biometric or hardware authenticator.

Configure with: `ControlR_AppOptions__PersistPasskeyLogin` (makes passkey login equivalent to "remember me")

## Roles

ControlR uses a role-based permission system with 5 built-in roles:

| Role | Permissions |
|------|-------------|
| **Server Administrator** | Full server-wide admin (stats, logs, alerts, server settings) |
| **Tenant Administrator** | Tenant-level admin (user/device/tag management, invites) |
| **Device Superuser** | Can access all devices in the tenant |
| **Agent Installer** | Can deploy/install agents on new devices |
| **Installer Key Manager** | Can manage installer keys |

Role assignments are done through the **Permissions** page (`/permissions`).

## Tags for Device Access

Beyond roles, device access is controlled via tags:
- A user must have either the `DeviceSuperuser` role **or** a matching tag to access a device
- Tags can be assigned to both users and devices
- Matching tags grant device access

## Next

- **[API Overview](/docs/api/overview)**: API structure and conventions
- **[Scalar API Browser](/docs/scalar-api-browser)**: Interactive API exploration
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
