---
sidebar_position: 6
title: Authentication Guide
---

## Overview

ControlR authenticates every request through a policy scheme that inspects headers and the request URL to pick the right handler. Five authentication schemes are supported:

1. **Cookie**: the default for the web UI (Blazor WASM).
2. **Bearer token**: ASP.NET Core Identity access tokens for interactive sign-in from desktop clients and scripts.
3. **Personal Access Token (PAT)**: long-lived, per-user tokens used via the `x-personal-token` header.
4. **Service Account credential**: non-interactive, server-scoped identities used via the `x-api-key` header.
5. **Logon Token**: single-use, single-device URLs for granting ad-hoc browser sessions.

External identity providers (Microsoft, GitHub) and passkeys (WebAuthn) are available on top of cookie or interactive-bearer flows.

## Dynamic Authentication Scheme

A single policy scheme (`CustomSchemes.Dynamic`) inspects each request and forwards it to the correct handler. The first matching rule wins:

| Detected signal | Handler |
|---|---|
| `x-api-key` header | Service Account |
| `/device-access?logonToken=...` query parameter | Logon Token |
| `Authorization: Bearer <token>` header | Interactive Bearer |
| `x-personal-token` header | Personal Access Token |
| Anything else | Cookie |

A single server instance can host the web UI, integration endpoints, and an RMM bot simultaneously, without requiring per-client configuration.

For the machine-to-machine schemes (PAT, Service Account, Logon Token), see the [API authentication guide](/docs/api/authentication). The rest of this page covers the interactive flows.

## 1. Cookie-Based Authentication (Web UI)

This is the default. Users land on the login page, submit credentials, and receive an authentication cookie. Subsequent requests reuse the cookie until logout or expiry.

1. Navigate to the ControlR web interface.
2. Enter your email and password.
3. If 2FA is enabled, enter the TOTP code.
4. If a passkey is registered, complete the platform authenticator prompt.
5. An authentication cookie is set for the session.

**Logout:** use the logout button in the UI, or `POST /api/internal/auth/logout`.

## 2. Bearer Token Authentication (Interactive Login)

Desktop clients and CLI tools that cannot rely on cookies use the Identity bearer-token endpoints. This flow requires `ControlR_AppOptions__EnableInteractiveBearerLogin` to be set to `true`.

**Obtaining a token:**

```bash
curl -X POST https://your-server/api/internal/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

If the account has 2FA enabled, call the same endpoint with `twoFactorCode` (or `twoFactorRecoveryCode`) appended to the request body. If the account has `RequirePasswordChange` set to `true`, the response will say so and require a `newPassword` plus a re-submission.

On success the response contains the issued access and refresh tokens along with the access-token lifetime.

```json
{
  "requiresTwoFactor": false,
  "isLockedOut": false,
  "requiresPasswordChange": false,
  "tokens": {
    "tokenType": "Bearer",
    "accessToken": "CfDJ8...",
    "expiresInSeconds": 3600,
    "refreshToken": "CfDJ8..."
  }
}
```

**Refreshing the token:**

```bash
curl -X POST https://your-server/api/internal/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'
```

**Token lifetimes** (configurable):

| Setting | Default |
|---|---|
| `ControlR_AppOptions__InteractiveBearerTokenExpirationMinutes` | `60` minutes |
| `ControlR_AppOptions__InteractiveRefreshTokenExpirationDays` | `30` days |

**Using the bearer token:**

```bash
curl https://your-server/api/v1/devices \
  -H "Authorization: Bearer <access-token>"
```

The typed .NET client in `ControlR.ApiClient` handles sign-in, refresh, and request attachment automatically when you set `options.AuthenticationMethod = InteractiveBearer`. See [NuGet Packages](/docs/api-reference/nuget-packages).

## External Authentication Providers

| Provider | Env vars |
|---|---|
| Microsoft Account | `ControlR_AppOptions__MicrosoftClientId`, `ControlR_AppOptions__MicrosoftClientSecret` |
| GitHub OAuth | `ControlR_AppOptions__GitHubClientId`, `ControlR_AppOptions__GitHubClientSecret` |

Set both a Client ID and a Client Secret to make the provider appear on the login page. Provider accounts are linked to the existing ControlR user on first sign-in. See [Configuration](/docs/configuration) for setup details.

## Two-Factor Authentication (2FA)

Users enable TOTP-based 2FA from the **Manage Account** page. The authenticator app label is controlled by `ControlR_AppOptions__AuthenticatorIssuerName` (default `"ControlR"`). Recovery codes are generated alongside the authenticator setup.

## Passkey Authentication (WebAuthn)

Passkeys provide passwordless sign-in via WebAuthn (Face ID, Touch ID, Windows Hello, hardware keys). Requires HTTPS at runtime (WebAuthn needs a secure context).

**Persisting passkey sessions:** by default, passkey sign-in creates a session that expires when the browser closes. Set `ControlR_AppOptions__PersistPasskeyLogin` to `true` to make passkey login equivalent to "remember me."

Passkeys are phishing-resistant (bound to the server's origin), use public-key cryptography (private keys never leave the device), and can sync across devices via iCloud Keychain, Google Password Manager, or similar providers. Users can manage them from the **Manage Account** page and revoke any that are lost or compromised.

## Roles

ControlR ships five built-in roles:

| Role | Scope |
|---|---|
| **Server Administrator** | Server-wide admin: stats, logs, alerts, server settings. Cannot reach into other tenants' devices or users. |
| **Tenant Administrator** | Tenant admin: users, devices, tags, invites, tenant settings. |
| **Device Superuser** | Access every device in the tenant, regardless of tag. |
| **Agent Installer** | Generate installer keys and deploy agents on new devices. |
| **Installer Key Manager** | Manage installer keys. |

Role assignments are managed through the **Permissions** page (`/permissions`). See [Permissions](/docs/user-guide/permissions).

## Tags for Device Access

Beyond roles, device access is gated by tags:

- A user can access a device if they have the `DeviceSuperuser` role, the matching tag, or are an admin.
- Tags are per-tenant and assigned independently to users and devices.
- Tag names must match `[a-z0-9-]` and be at most 100 characters.
- The four built-in role names (`ServerAdministrator`, etc.) are reserved and cannot be used as tag names.

Tag CRUD is done through the **Permissions** page under the **Tags** tab; assignments are done under the **Users** and **Devices** tabs.

## Next

- **[API Authentication](/docs/api/authentication)**: PAT, service account, and logon token usage with curl examples
- **[API Overview](/docs/api/overview)**: REST API structure and conventions
- **[Configuration](/docs/configuration)**: All `AppOptions` related to authentication
