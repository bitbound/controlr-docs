---
sidebar_position: 1
title: API Endpoints
---

## Overview

ControlR's API is split into three route roots, each serving a distinct audience:

| Route root | Audience | Contract | Versioning | Example |
|---|---|---|---|---|
| `/api/internal/*` | Blazor Web UI (BFF), device agents | Dynamic | No | `/api/internal/users` |
| `/api/v1/*` | S2S automation | Stable contract | Yes | `/api/v1/service-accounts` |
| `/api/agent/*` | Device agents (anonymous) | Dynamic | No | `/api/agent/updates` |

**Legacy fallback:** All Internal endpoints also respond at their old `/api/*` paths (e.g., `/api/users` still works). These legacy paths are maintained for backward compatibility and will be removed in a future release. New integrations should target the canonical `/api/internal/*` paths.

## Authentication Requirements

| Auth Type | Description |
|-----------|-------------|
| **None** | Public endpoint, no authentication required |
| **Any Auth** | Any authentication method (cookie, bearer, PAT) |
| **Service Account** | Server-scoped service account via `x-api-key` header (V1 routes only) |
| **Specific Roles** | Requires specific role(s) listed |

---

## V1 Endpoints (S2S Automation)

All V1 routes are under `/api/v1/*`. Auth requires a server-scoped service account (`x-api-key`) or the `ServerAdministrator` role. All tenant, user, and device identifiers must be explicit in the request. The V1 surface uses ASP.NET Core API versioning with `[ApiVersion("1")]`.

### Service Accounts (`/api/v1/service-accounts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/service-accounts` | Service Account | Create a server service account |
| GET | `/api/v1/service-accounts` | Service Account | List all service accounts |
| GET | `/api/v1/service-accounts/{id}` | Service Account | Get a specific service account |
| DELETE | `/api/v1/service-accounts/{id}` | Service Account | Delete a service account |
| POST | `/api/v1/service-accounts/{id}/credentials` | Service Account | Add a credential (returns secret once) |
| DELETE | `/api/v1/service-accounts/{id}/credentials/{credId}` | Service Account | Revoke a credential |

### Tenants (`/api/v1/tenants`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tenants` | Service Account | Create a tenant |
| GET | `/api/v1/tenants/{id}` | Service Account | Get a tenant |
| PUT | `/api/v1/tenants/{id}` | Service Account | Update a tenant |
| DELETE | `/api/v1/tenants/{id}` | Service Account | Delete a tenant |

### Devices (`/api/v1/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/devices` | Service Account | Cross-tenant device listing |
| GET | `/api/v1/devices/{deviceId}` | Service Account | Get a specific device (any tenant) |
| DELETE | `/api/v1/devices/{deviceId}` | Service Account | Delete a device |
| POST | `/api/v1/devices/delete-many` | Service Account | Delete multiple devices |
| POST | `/api/v1/devices/search` | Service Account | Search/filter devices |
| GET | `/api/v1/devices/summary` | Service Account | Get device summaries |
| PATCH | `/api/v1/devices/{deviceId}/alias` | Service Account | Update device alias |

### Installer Keys (`/api/v1/installer-keys`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/installer-keys` | Service Account | Create an installer key (requires explicit tenant ID) |

### Logon Tokens (`/api/v1/logon-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/logon-tokens/external` | Service Account | Create a service logon token (requires `tenantId`, `deviceId`, `userCorrelationId`) |
| POST | `/api/v1/logon-tokens/user` | Service Account | Create a user logon token (requires explicit `userId`) |

---

## Internal Endpoints (BFF / Web UI)

All Internal routes are under `/api/internal/*`. Auth uses cookie, bearer, or PAT. These endpoints also respond at legacy `/api/*` paths for backward compatibility. Controllers derive tenant and user context from claims.

### Authentication (`/api/internal/auth`)

ASP.NET Core Identity endpoints are mounted under `/api/internal/auth/*` with the routes that `MapIdentityApi` exposes, plus ControlR-specific additions.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/auth/register` | None | User registration (gated by `EnablePublicRegistration` / first-user bootstrap) |
| POST | `/api/internal/auth/login` | None | Email + password sign-in (issues cookie) |
| POST | `/api/internal/auth/refresh` | None | Refresh a bearer token |
| GET | `/api/internal/auth/confirmEmail` | None | Confirm an email address |
| POST | `/api/internal/auth/resendConfirmationEmail` | None | Resend the confirmation email |
| POST | `/api/internal/auth/forgotPassword` | None | Request a password reset email |
| POST | `/api/internal/auth/resetPassword` | None | Reset a password with a code |
| POST | `/api/internal/auth/manage/2fa` | Any | Enable, disable, or verify 2FA |
| GET | `/api/internal/auth/manage/info` | Any | Get two-factor and recovery-code status |
| POST | `/api/internal/auth/manage/info` | Any | Update 2FA / recovery code state |
| POST | `/api/internal/auth/change-password` | Any | Change the current user's password |
| POST | `/api/internal/auth/change-password-with-credentials` | None | Change password with email + current password (+ optional 2FA) |
| POST | `/api/internal/auth/complete-password-reset` | None | Complete a password reset using a code |
| POST | `/api/internal/auth/interactive-login` | None | Interactive bearer-token login (requires `EnableInteractiveBearerLogin`) |
| POST | `/api/internal/auth/logout` | Cookie | Sign out of the web UI |
| GET | `/api/internal/auth/me` | Any | Get the current user's profile, roles, and tenant |

> Note: routes inherited from ASP.NET Core Identity use camelCase (`forgotPassword`, `manage/2fa`, etc.). Routes added by ControlR use kebab-case (`change-password`, `complete-password-reset`, `interactive-login`).

---

## Devices (`/api/internal/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/devices` | Any | List all devices for the tenant |
| GET | `/api/internal/devices/{deviceId}` | Any (resource policy) | Get a specific device |
| DELETE | `/api/internal/devices/{deviceId}` | Any (resource policy) | Delete a device |
| PATCH | `/api/internal/devices/{deviceId}/alias` | Any | Update device alias |
| POST | `/api/internal/devices/search` | Any | Search/filter/paginate devices |
| POST | `/api/internal/devices/delete-many` | Any (resource policy) | Delete multiple devices |
| GET | `/api/internal/devices/summary` | Any | Get a summary list of all devices |

---

## File System (`/api/internal/device-file-system`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/device-file-system/contents` | Any + device access | Get directory listing |
| POST | `/api/internal/device-file-system/path-segments` | Any + device access | Path segments for autocomplete |
| POST | `/api/internal/device-file-system/root-drives` | Any + device access | Get root drives |
| POST | `/api/internal/device-file-system/subdirectories` | Any + device access | Get subdirectories |
| POST | `/api/internal/device-file-system/create-directory/{deviceId}` | Any + device access | Create directory |
| POST | `/api/internal/device-file-system/upload/{deviceId}` | Any + device access | Upload file |
| GET | `/api/internal/device-file-system/download/{deviceId}` | Any + device access | Download single file |
| POST | `/api/internal/device-file-system/download-archive/{deviceId}` | Any + device access | Download archive |
| POST | `/api/internal/device-file-system/download-archive/{deviceId}/form` | Any + device access | Download archive (form-encoded) |
| DELETE | `/api/internal/device-file-system/delete-path/{deviceId}` | Any + device access | Delete file/directory |
| GET | `/api/internal/device-file-system/logs/{deviceId}` | Any + device access | Get log files |
| GET | `/api/internal/device-file-system/logs/{deviceId}/contents` | Any + device access | Get log file contents |

---

## Tags (`/api/internal/tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/tags` | TenantAdministrator | Create a tag |
| GET | `/api/internal/tags` | TenantAdministrator | List all tags |
| PUT | `/api/internal/tags` | TenantAdministrator | Rename a tag |
| DELETE | `/api/internal/tags/{tagId}` | TenantAdministrator | Delete a tag |

---

## User Tags (`/api/internal/user-tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/user-tags` | Any | Add a tag to a user |
| GET | `/api/internal/user-tags` | Any | Get allowed tags |
| GET | `/api/internal/user-tags/{userId}` | TenantAdministrator | Get tags for a specific user |
| DELETE | `/api/internal/user-tags/{userId}/{tagId}` | TenantAdministrator | Remove tag from a user |

---

## Device Tags (`/api/internal/device-tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/device-tags` | TenantAdministrator | Add a tag to a device |
| DELETE | `/api/internal/device-tags/{deviceId}/{tagId}` | TenantAdministrator | Remove tag from a device |

---

## Users (`/api/internal/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/users` | TenantAdministrator | Create a new user |
| GET | `/api/internal/users` | TenantAdministrator | List all users in tenant |
| GET | `/api/internal/users/{userId}` | TenantAdministrator | Get a specific user |
| DELETE | `/api/internal/users/{userId}` | TenantAdministrator | Delete a user |
| POST | `/api/internal/users/{userId}/reset-password` | TenantAdministrator | Reset user password |
| POST | `/api/internal/users/{userId}/personal-access-tokens` | TenantAdministrator | Create PAT for a user |
| GET | `/api/internal/users/{userId}/personal-access-tokens` | TenantAdministrator | List PATs for a user |
| PUT | `/api/internal/users/{userId}/personal-access-tokens/{tokenId}` | TenantAdministrator | Update a PAT for a user |
| DELETE | `/api/internal/users/{userId}/personal-access-tokens/{tokenId}` | TenantAdministrator | Delete a PAT for a user |

---

## User Roles (`/api/internal/user-roles`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/user-roles` | Any | Add a role to a user |
| GET | `/api/internal/user-roles` | Any | Get current user's roles |
| GET | `/api/internal/user-roles/{userId}` | TenantAdministrator | Get roles for a specific user |
| DELETE | `/api/internal/user-roles/{userId}/{roleId}` | TenantAdministrator | Remove a role from a user |

---

## Roles (`/api/internal/roles`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/roles` | TenantAdministrator | List all roles with member user IDs |

---

## Installer Keys (`/api/internal/installer-keys`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/installer-keys` | TenantAdministrator or InstallerKeyManager | Create an installer key |
| GET | `/api/internal/installer-keys` | TenantAdministrator or InstallerKeyManager | List all installer keys |
| DELETE | `/api/internal/installer-keys/{id}` | TenantAdministrator or InstallerKeyManager | Delete an installer key |
| GET | `/api/internal/installer-keys/usages/{keyId}` | TenantAdministrator or InstallerKeyManager | Get usage history for a key |
| PUT | `/api/internal/installer-keys/rename` | TenantAdministrator or InstallerKeyManager | Rename an installer key |

Installer-key usage is recorded server-side when an agent installs using a key. There is no separate increment endpoint.

---

## Personal Access Tokens (`/api/internal/personal-access-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/personal-access-tokens` | Any | Create a PAT |
| GET | `/api/internal/personal-access-tokens` | Any | List own PATs |
| PUT | `/api/internal/personal-access-tokens/{id}` | Any | Update a PAT |
| DELETE | `/api/internal/personal-access-tokens/{id}` | Any | Delete a PAT |

---

## Logon Tokens (`/api/internal/logon-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/logon-tokens` | Any + device access | Create a user logon token (returns device access URL) |

---

## Invites (`/api/internal/invites`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/invites` | TenantAdministrator | Create an invite |
| GET | `/api/internal/invites` | TenantAdministrator | List all invites for tenant |
| DELETE | `/api/internal/invites/{inviteId}` | TenantAdministrator | Delete an invite |
| POST | `/api/internal/invites/accept` | None | Accept an invite (anonymous) |

---

## Desktop Preview (`/api/internal/desktop-preview`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/desktop-preview/{deviceId}/{targetProcessId}` | Any + device access | Get a JPEG preview of a process window |

---

## Version (`/api/internal/version`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/version/agent` | None | Get current agent version |
| GET | `/api/internal/version/server` | None | Get server assembly version |

---

## User Preferences (`/api/internal/user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/user-preferences` | Any | Get all user preferences |
| GET | `/api/internal/user-preferences/{name}` | Any | Get a specific preference |
| POST | `/api/internal/user-preferences` | Any | Set a preference |
| PUT | `/api/internal/user-preferences` | Any | Set multiple preferences |

---

## Effective User Preferences (`/api/internal/effective-user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/effective-user-preferences` | Any | Get merged tenant + user preferences |

---

## Tenant Settings (`/api/internal/tenant-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/tenant-settings` | Any | Get all tenant settings |
| GET | `/api/internal/tenant-settings/{name}` | Any | Get a specific setting |
| POST | `/api/internal/tenant-settings` | TenantAdministrator | Set a single setting |
| PUT | `/api/internal/tenant-settings` | TenantAdministrator | Set multiple settings |
| DELETE | `/api/internal/tenant-settings/{name}` | TenantAdministrator | Delete a setting |

---

## Server Settings (`/api/internal/user-server-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/user-server-settings/file-upload-max-size` | Any | Get max file upload size |
| GET | `/api/internal/user-server-settings/decommission-status` | Any | Get server decommission status |

---

## Server Admin (`/api/internal/server-*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/server-stats` | ServerAdministrator | Get server statistics |
| GET | `/api/internal/server-logs/get-aspire-url` | ServerAdministrator | Get Aspire Dashboard URL with auth token |
| GET | `/api/internal/server-alert` | Any | Get server-wide alert |
| POST | `/api/internal/server-alert` | ServerAdministrator | Update server alert |
| POST | `/api/internal/test-email` | Any | Send test email to current user |
| GET | `/api/internal/public-server-settings` | None | Get public server settings: whether public registration is enabled, and whether desktop preview is disabled |

---

## Agent Endpoints (`/api/agent/*`)

Agent endpoints are for device agent communication and are separate from the BFF and S2S surfaces. They are anonymous (no user authentication required).

### Agent Update

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/agent/updates/get-bundle-metadata/{runtime}` | None | Get download metadata (URLs + SHA256) for agent bundle |

### Device Registration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/agent/devices` | Installer key | Register/install agent on a device |

---

## SignalR Hubs

Both hubs use the MessagePack protocol with JSON fallback. The `AgentHub` validates device identity on first update; the `ViewerHub` requires an authenticated session.

### AgentHub (`/hubs/agent`)

Agents connect to this hub to register, send updates, and receive commands.

**Server methods (called by agent):**
- `CloseChatSession(sessionId, targetProcessId)`
- `CloseTerminalSession(terminalSessionId)`
- `CreateDirectory(dto)`
- `CreateRemoteControlSession(dto)`
- `CreateTerminalSession(terminalSessionId, viewerConnectionId)`
- `CreateVncSession(dto)`
- `DeleteFile(dto)`
- `DownloadFileFromViewer(dto)`
- `GetActiveDesktopSessions()`
- `GetLogFiles()`
- `GetPathSegments(dto)`
- `GetPwshCompletions(request)`
- `GetRootDrives(request)`
- `InvokeCtrlAltDel(request)`
- `InvokeWakeDevice(dto)`
- `ReceiveAgentUpdateTrigger()`
- `ReceivePowerStateChange(changeType)`
- `ReceiveTerminalInput(dto)`
- `RefreshDeviceInfo()`
- `RequestDesktopPreview(dto)`
- `RequestRemoteControlPermission(targetProcessId)`
- `SendChatMessage(dto)`
- `StreamDirectoryContents(dto)`
- `StreamFileContents(dto)`
- `StreamSubdirectories(dto)`
- `TestVncConnection(port)`
- `UninstallAgent(reason)`
- `UploadArchiveToViewer(dto)`
- `UploadFileToViewer(dto)`
- `ValidateFilePath(dto)`

The server publishes real-time device updates, terminal output, and chat messages back through these methods.

### ViewerHub (`/hubs/viewer`)

Authenticated viewers connect to this hub for device control.

**Server methods (called by viewer):**
- `CloseChatSession(deviceId, sessionId, targetProcessId)`
- `CloseTerminalSession(deviceId, terminalSessionId)`
- `CreateTerminalSession(deviceId, terminalSessionId)`
- `GetActiveDesktopSessions(deviceId)`
- `GetPwshCompletions(request)`
- `InvokeCtrlAltDel(deviceId, targetDesktopProcessId, sessionType)`
- `RefreshDeviceInfo(deviceId)`
- `RequestRemoteControlPermission(deviceId, targetProcessId)`
- `RequestRemoteControlSession(deviceId, sessionRequest)`
- `RequestVncSession(deviceId, sessionRequest)`
- `SendAgentUpdateTrigger(deviceId)`
- `SendChatMessage(deviceId, dto)`
- `SendDtoToAgent(deviceId, wrapper)`
- `SendDtoToUserGroups(wrapper)`
- `SendPowerStateChange(deviceId, changeType)`
- `SendTerminalInput(deviceId, dto)`
- `SendWakeDevice(deviceId, macAddresses)`
- `TestVncConnection(deviceId, port)`
- `UninstallAgent(deviceId, reason)`
- `UploadFile(metadata, fileStream)`

Pushed from server to the viewer client: `ReceiveDeviceUpdate`, `ReceiveChatResponse`, `ReceiveTerminalOutput`, `ReceiveServerStats`, `InvokeToast`.

## Next

- **[NuGet Packages](/docs/api-reference/nuget-packages)**: API client and viewer packages
- **[Scalar API Browser](/docs/scalar-api-browser)**: Interactive API exploration
- **[API Overview](/docs/api/overview)**: API structure and conventions
