---
sidebar_position: 0
title: Authentication Guide
---

## Overview

ControlR uses a multi-scheme authentication pipeline that automatically routes requests to the appropriate handler. There are **four authentication schemes**:

1. **Cookie-based authentication**: Default for the web UI (Blazor WASM)
2. **Bearer token authentication**: For interactive login via API (desktop clients, scripts)
3. **Personal Access Token (PAT)**: For long-lived programmatic access
4. **Logon Token**: For single-use device access URLs

Additionally, ControlR supports external identity providers (Microsoft, GitHub) and passkey authentication.

## Dynamic Authentication Scheme

ControlR uses a policy scheme that automatically selects the right handler based on the request:

| Request Type | Handler |
|-------------|---------|
| `/device-access` with `logonToken` query param | Logon Token handler |
| `Authorization: Bearer <token>` header | Bearer Token handler |
| `x-personal-token` header | PAT handler |
| Everything else | Cookie-based authentication |

## 1. Cookie-Based Authentication (Web UI)

This is the default authentication method for the web interface. Users log in through the login page and receive an authentication cookie.

**How it works:**
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
| `ControlR_AppOptions__InteractiveBearerTokenExpirationMinutes` | `60` | Access token lifetime (minutes) |
| `ControlR_AppOptions__InteractiveRefreshTokenExpirationDays` | `30` | Refresh token lifetime (days) |

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

## 4. Logon Tokens

Logon Tokens are time-limited, single-use tokens that grant access to a **specific device**. They're commonly used in automation scripts alongside PATs.

**Creating a logon token:**
```bash
curl -X POST https://your-server/api/logon-tokens \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"<device-guid>"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://your-server/device-access?logonToken=<token>&deviceId=<guid>"
  }
}
```

The returned URL opens a browser session with access to the specified device. Since it's single-use, it can only be accessed once.

## External Authentication Providers

### Microsoft Account

1. Create an App Registration in Azure Active Directory
2. Set the Client ID and Client Secret:
   - `ControlR_AppOptions__MicrosoftClientId`
   - `ControlR_AppOptions__MicrosoftClientSecret`
3. Users can then choose "Microsoft" on the login page

### GitHub OAuth

1. Create an OAuth App in GitHub
2. Set the Client ID and Client Secret:
   - `ControlR_AppOptions__GitHubClientId`
   - `ControlR_AppOptions__GitHubClientSecret`
3. Users can then choose "GitHub" on the login page

External providers require both a Client ID and Client Secret to be configured. They appear as login options on the login page.

## Two-Factor Authentication (2FA)

Users can enable TOTP-based 2FA through their account settings. The authenticator app name is controlled by `ControlR_AppOptions__AuthenticatorIssuerName` (default: "ControlR").

## Passkey Authentication (WebAuthn)

Passkeys provide passwordless authentication using the Web Authentication (WebAuthn) API. Users can sign in using their device's built-in biometric or hardware authenticator: Face ID, Touch ID, Windows Hello, or a physical security key.

### Enabling Passkey Support

Passkey support is built into ControlR and requires no server-side configuration beyond ensuring your server is served over HTTPS (WebAuthn requires a secure context).

### Registering a Passkey

1. Log in to the ControlR web interface using your username and password
2. Navigate to your **account settings** or profile section
3. Look for the **Passkey** or **Security Key** section
4. Click **Add Passkey** and follow your browser's prompts:
   - **Windows**: Windows Hello (PIN, fingerprint, or facial recognition)
   - **macOS**: Touch ID or iCloud Keychain
   - **Android**: Screen lock or biometric
   - **iOS/iPadOS**: Face ID or Touch ID
   - **Hardware Key**: USB-C/NFC security key (YubiKey, etc.)

### Signing In with a Passkey

1. On the login page, click **Sign in with Passkey**
2. Your browser will prompt you to authenticate using your registered method
3. On completion, you're logged in. No password entry required.

### Persisting Passkey Sessions

By default, passkey login creates a session that expires when the browser closes. To persist the session across browser restarts, set:

```yaml
ControlR_AppOptions__PersistPasskeyLogin: true
```

When `true`, passkey login acts like "remember me" and keeps the user signed in even after closing and reopening the browser.

### Managing Passkeys

Users can view and revoke registered passkeys from their account settings. If a passkey is lost or compromised, remove it immediately and register a new one.

### Security Considerations

- Passkeys are **phishing-resistant**. They're tied to the specific origin (your ControlR server domain)
- They use **public-key cryptography**. The private key never leaves the user's device.
- Multiple passkeys can be registered per account (e.g., one per device)
- Passkeys can be synced across devices via iCloud Keychain, Google Password Manager, or similar providers

## Roles

ControlR uses a role-based permission system with 5 built-in roles:

| Role | Permissions |
|------|-------------|
| **Server Administrator** | Full server-wide admin (stats, logs, alerts, server settings). Does NOT allow access to other tenants' devices or users. |
| **Tenant Administrator** | Tenant-level admin: manage users, devices, tags, invites, and tenant settings |
| **Device Superuser** | Can access all devices in the tenant |
| **Agent Installer** | Can deploy/install agents on new devices |
| **Installer Key Manager** | Can manage installer keys |

Role assignments are done through the **Permissions** page (`/permissions`).

## Tags for Device Access

Beyond roles, device access is controlled via tags:
- A user must have either the `DeviceSuperuser` role **or** a matching tag to access a device
- Tags can be assigned to both users and devices
- Matching tags grant device access

Tags are managed in the **Permissions** page under the **Tags** tab. Assign tags to users and devices in the **Users** and **Devices** tabs respectively.

## Next

- **[API Overview](/docs/api/overview)**: API structure and conventions
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
