---
sidebar_position: 5
title: Authentication Guide
---

## Overview

ControlR authenticates every request through one dynamic authentication policy scheme, which inspects the request and picks a handler per request. Five authentication schemes are supported:

1. **Cookie**: the default for the web UI (Blazor Web App).
2. **Logon Token**: single-use, single-device URLs for granting ad-hoc browser sessions.
3. **Bearer token**: ASP.NET Core Identity access tokens for interactive sign-in from API clients and scripts. Disabled unless `EnableInteractiveBearerLogin` is set.
4. **Personal Access Token (PAT)**: long-lived, per-user tokens sent in the `x-personal-token` header.
5. **Service Account credential**: non-interactive identities sent in the `x-api-key` header. Both server-kind and tenant-kind accounts use this header, and a tenant-kind account is confined to its own tenant.

External identity providers (Microsoft, GitHub) and passkeys (WebAuthn) are part of the cookie sign-in flow. They do not produce bearer tokens, and they are not available to the machine-to-machine schemes.

## Dynamic Authentication Scheme

The first matching rule wins, in this order:

| Order | Detected signal | Handler | Available when |
|---|---|---|---|
| 1 | `logonToken` and `deviceId` query parameters, on a path starting with `/device-access` | Logon Token | Always |
| 2 | `Authorization: Bearer <token>` header | Interactive Bearer | `ControlR_AppOptions__EnableInteractiveBearerLogin` is `true` |
| 3 | `x-personal-token` header | Personal Access Token | Always |
| 4 | `x-api-key` header | Service Account Credential | Always |
| 5 | Anything else | Identity Cookie | Always |

Two consequences are worth knowing before you debug an integration:

- The machine-to-machine credentials are read from their own headers. Placing a PAT or an API key in the `Authorization` header is not recognized, so the request falls through to the cookie scheme and comes back `401`.
- With `EnableInteractiveBearerLogin` off, a `Bearer` header is not routed to the bearer handler. It also falls through to the cookie scheme.

A single server instance can host the web UI, integration endpoints, and an RMM bot at the same time without per-client configuration.

For the machine-to-machine schemes (PAT, Service Account, Logon Token), see the [API authentication guide](/docs/api/authentication). The rest of this page covers the interactive flows.

## 1. Cookie-Based Authentication (Web UI)

This is the default. Users land on the login page, submit credentials, and receive an authentication cookie. Subsequent requests reuse the cookie until logout or expiry.

1. Navigate to the ControlR web interface.
2. Enter your email and password, and choose whether to stay signed in.
3. If 2FA is enabled, enter the TOTP code on the follow-up page.
4. Alternatively, choose **Sign in with a passkey** to skip the password, or use a configured external provider.
5. An authentication cookie is set for the session.

**Logout:** use the logout button in the UI, or `POST /api/auth/logout`.

## 2. Bearer Token Authentication (Interactive Login)

Clients that cannot rely on cookies use Identity bearer tokens. This whole area is opt-in. Set `ControlR_AppOptions__EnableInteractiveBearerLogin` to `true`, and the server maps the Identity endpoints under `/api/auth` and starts routing `Bearer` headers to the bearer handler. With the flag off, those endpoints are not mapped and the custom login endpoint responds `404`.

### Interactive login endpoint

`POST /api/auth/interactive-login` returns a status object rather than always returning tokens, so a client can tell 2FA, lockout, and a forced password change apart.

```bash
curl -X POST https://your-server/api/auth/interactive-login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

The request body accepts `email`, `password`, and optionally `twoFactorCode` or `twoFactorRecoveryCode`. The response shape is:

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

When `requiresTwoFactor` is `true`, `tokens` is absent. Resend the request with `twoFactorCode` or `twoFactorRecoveryCode`.

When `requiresPasswordChange` is `true`, `tokens` is also absent. The account's password must be changed before it can obtain a token. Call `POST /api/auth/change-password-with-credentials` with `email`, `currentPassword`, `newPassword`, and `twoFactorCode` if the account has 2FA. Until the change succeeds, middleware rejects every other authenticated API path with `403`.

### Stock Identity endpoints

The Identity endpoint set is mapped in the same group. `POST /api/auth/login` is the stock Identity endpoint and returns a single `token` object rather than the status fields above. `POST /api/auth/refresh` takes a `refreshToken` and issues a new access token.

```bash
curl -X POST https://your-server/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'
```

**Token lifetimes:**

| Setting | Default |
|---|---|
| `ControlR_AppOptions__InteractiveBearerTokenExpirationMinutes` | `60` minutes |
| `ControlR_AppOptions__InteractiveRefreshTokenExpirationDays` | `30` days |

**Using the bearer token:**

```bash
curl https://your-server/api/v1/devices \
  -H "Authorization: Bearer <access-token>"
```

Bearer tokens are read only from the `Authorization` header. No handler reads a bearer token from a query string, so a SignalR connection still needs a cookie or a logon token.

`ControlR.ApiClient` can perform interactive bearer sign-in. `ControlrApiClientBuilder.GetAuthSession()` returns an `IControlrAuthSession` whose `SignIn` posts to the interactive-login endpoint and refreshes the access token for you, so a bearer-token client does not hand-roll the flow. Its options also carry `PersonalAccessToken` and `ServiceAccountApiKey` for callers that already hold a credential. See [NuGet Packages](/docs/api-reference/nuget-packages#authentication-modes).

## 3. Logon Token Authentication

A logon token grants a browser a session for one device. The request must carry both parameters, and the path must start with `/device-access`:

```
https://your-server/device-access?logonToken=<token>&deviceId=<device-guid>
```

The handler validates and consumes the token in the same call, so a logon token is single-use. It also requires the device ID to match the token's grant, and a token may be restricted to specific desktop sessions. On success the handler signs in the application cookie scheme for a fresh session window, measured from redemption and defaulting to 480 minutes, so the follow-up requests that a page makes are covered by the cookie rather than by replaying the token. That window is independent of the token's own expiry.

## External Authentication Providers

| Provider | Env vars |
|---|---|
| Microsoft Account | `ControlR_AppOptions__MicrosoftClientId`, `ControlR_AppOptions__MicrosoftClientSecret` |
| GitHub OAuth | `ControlR_AppOptions__GitHubClientId`, `ControlR_AppOptions__GitHubClientSecret` |

Set both a Client ID and a Client Secret to make the provider appear on the login page.

An external sign-in does not silently attach itself to an existing account. The server looks for a user who already has a login for that provider and provider key, and signs that user in. If nobody has linked it, the visitor is shown a registration form, which creates a new account and a new tenant through the public-registration path. That path is refused when registration is closed, so close signup before you enable a provider if you do not want new tenants appearing. Existing users link an external account themselves from **Manage account** → **External logins**. See [Configuration](/docs/configuration) for setup details.

## Two-Factor Authentication (2FA)

Users enable TOTP-based 2FA from the **Manage Account** page. The authenticator app label is controlled by `ControlR_AppOptions__AuthenticatorIssuerName` (default `"ControlR"`). Recovery codes are generated alongside the authenticator setup, and a recovery code can replace a code from the app at sign-in.

## Passkey Authentication (WebAuthn)

Passkeys provide passwordless sign-in via WebAuthn (Face ID, Touch ID, Windows Hello, hardware keys). The assertion is completed on the server-rendered login page, and it produces the same cookie as a password sign-in. Requires HTTPS at runtime (WebAuthn needs a secure context).

**Persisting passkey sessions:** by default, passkey sign-in creates a session that expires when the browser closes. Set `ControlR_AppOptions__PersistPasskeyLogin` to `true` to make passkey login equivalent to "remember me."

Passkeys are phishing-resistant (bound to the server's origin), use public-key cryptography (private keys never leave the device), and can sync across devices via iCloud Keychain, Google Password Manager, or similar providers. Users can manage them from the **Manage Account** page and revoke any that are lost or compromised.

## First Contact With A Server

Two different bootstraps exist, and they use different credentials.

**A person.** Signup is open when `EnablePublicRegistration` is `true`, or when `DisableFirstUserSelfRegistration` is `false` and the server has no users yet. The second condition is the one-time bootstrap that lets the first account claim the server. See [Multi-Tenancy](/docs/multi-tenancy) for what that first account is granted.

**An agent.** The installer registers the device with `POST /api/agent/devices`. The credential is the installer key ID and secret inside the request body, not a header. The key fixes the tenant the device lands in, and the installer sends the device's new Ed25519 public key in the same call. After that, the running agent authenticates its status updates with a signature from the matching private key rather than with a token. `AllowAgentsToSelfBootstrap` lets an agent register without a key, but only on a server with exactly one tenant.

## Permissions

ControlR uses a fine-grained, scope-based permission system instead of fixed roles. Each capability is a namespaced permission (e.g. `device.read`, `tenant.users.write`) granted to a principal (user, user group, service account, personal access token, or logon token) at a specific scope (server, tenant, customer, device group, device, or user group). Most policies are tenant-scoped and resolve against the caller's own tenant claim. An explicit deny always overrides allow.

To make broad grants easy, ControlR provides named **presets**, which are curated bundles of related permissions. The seven presets are Server Administrator, Tenant Administrator, Device Superuser, Agent Installer, Installer Key Manager, Service Account Manager, and Self Service. Self Service is seeded automatically for every user who signs in with a ControlR account rather than an external login, and it covers that user's own personal access tokens. Applying a preset grants all of its permissions at the appropriate scope.

Permissions are managed through the **Permissions** page (`/permissions`). See [Permissions](/docs/user-guide/permissions) and the [Permission System](/docs/permission-system) for the full model.

## Tags

Tags are string labels used to organize and filter devices. Device access is governed entirely by permission assignments. Tags are managed on the **Tags** page (`/tags`). Tag names must match `[a-z0-9-]` and be at most 50 characters.

## Next

- **[API Authentication](/docs/api/authentication)**: PAT, service account, and logon token usage with curl examples
- **[API Overview](/docs/api/overview)**: REST API structure and conventions
- **[Configuration](/docs/configuration)**: All `AppOptions` related to authentication
