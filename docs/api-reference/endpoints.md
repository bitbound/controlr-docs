---
sidebar_position: 1
title: API Endpoints
---

## Overview

ControlR's API is split into three route roots, each serving a distinct audience:

| Route root | Audience | Contract | Versioning | Example |
|---|---|---|---|---|
| `/api/internal/*` | Blazor Web UI (BFF), device agents | Dynamic | No | `/api/internal/users` |
| `/api/v0/*` | S2S automation | Stable contract | Yes | `/api/v0/service-accounts` |
| `/api/agent/*` | Device agents (anonymous) | Dynamic | No | `/api/agent/updates` |

**Legacy fallback:** All Internal endpoints also respond at their old `/api/*` paths (e.g., `/api/users` still works). These legacy paths are maintained for backward compatibility and will be removed in a future release. New integrations should target the canonical `/api/internal/*` paths.

## Authentication Requirements

| Auth Type | Description |
|-----------|-------------|
| **None** | Public endpoint, no authentication required |
| **Any Auth** | Any authentication method (cookie, bearer, PAT) |
| **Service Account** | Server-scoped service account via `x-api-key` header (V0 routes only) |
| **Specific Roles** | Requires specific role(s) listed |

---

## V0 Endpoints (S2S Automation)

All V0 routes are under `/api/v0/*`. Auth requires a server-scoped service account (`x-api-key`) or the `ServerAdministrator` role. All tenant, user, and device identifiers must be explicit in the request. The V0 surface uses ASP.NET Core API versioning with `[ApiVersion("0")]`.

### Service Accounts (`/api/v0/service-accounts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v0/service-accounts` | Service Account | Create a server service account |
| GET | `/api/v0/service-accounts` | Service Account | List all service accounts |
| GET | `/api/v0/service-accounts/{id}` | Service Account | Get a specific service account |
| DELETE | `/api/v0/service-accounts/{id}` | Service Account | Delete a service account |
| POST | `/api/v0/service-accounts/{id}/credentials` | Service Account | Add a credential (returns secret once) |
| DELETE | `/api/v0/service-accounts/{id}/credentials/{credId}` | Service Account | Revoke a credential |

### Tenants (`/api/v0/tenants`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v0/tenants` | Service Account | Create a tenant |
| GET | `/api/v0/tenants/{id}` | Service Account | Get a tenant |
| PUT | `/api/v0/tenants/{id}` | Service Account | Update a tenant |
| DELETE | `/api/v0/tenants/{id}` | Service Account | Delete a tenant |

### Devices (`/api/v0/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v0/devices` | Service Account | Cross-tenant device listing |
| GET | `/api/v0/devices/{deviceId}` | Service Account | Get a specific device (any tenant) |
| DELETE | `/api/v0/devices/{deviceId}` | Service Account | Delete a device |
| POST | `/api/v0/devices/delete-many` | Service Account | Delete multiple devices |
| POST | `/api/v0/devices/search` | Service Account | Search/filter devices |
| GET | `/api/v0/devices/summary` | Service Account | Get device summaries |
| PATCH | `/api/v0/devices/{deviceId}/alias` | Service Account | Update device alias |

### Installer Keys (`/api/v0/installer-keys`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v0/installer-keys` | Service Account | Create an installer key (requires explicit tenant ID) |

### Logon Tokens (`/api/v0/logon-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v0/logon-tokens/external` | Service Account | Create a service logon token (requires `tenantId`, `deviceId`, `userCorrelationId`) |
| POST | `/api/v0/logon-tokens/user` | Service Account | Create a user logon token (requires explicit `userId`) |

---

## Internal Endpoints (BFF / Web UI)

All Internal routes are under `/api/internal/*`. Auth uses cookie, bearer, or PAT. These endpoints also respond at legacy `/api/*` paths for backward compatibility. Controllers derive tenant and user context from claims.

### Authentication (`/api/internal/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/auth/login` | None | Cookie-based login |
| POST | `/api/internal/auth/logout` | Cookie | Sign out |
| POST | `/api/internal/auth/register` | None | User registration |
| POST | `/api/internal/auth/interactive-login` | None | Bearer token login (2FA supported) |
| POST | `/api/internal/auth/refresh` | None | Refresh bearer token |
| POST | `/api/internal/auth/forgot-password` | None | Request password reset email |
| POST | `/api/internal/auth/reset-password` | None | Reset password with code |
| POST | `/api/internal/auth/complete-password-reset` | None | Complete password reset |
| POST | `/api/internal/auth/confirm-email` | None | Confirm email address |
| POST | `/api/internal/auth/resend-confirmation-email` | None | Resend confirmation email |
| POST | `/api/internal/auth/change-password` | Any | Change password |
| POST | `/api/internal/auth/change-password-with-credentials` | None | Change password with credentials + 2FA |
| POST | `/api/internal/auth/manage-two-factor` | Any | Enable/disable/verify 2FA |
| GET | `/api/internal/auth/manage-info` | Any | Get manage info |
| POST | `/api/internal/auth/update-manage-info` | Any | Update manage info |
| GET | `/api/internal/auth/me` | Any | Get current user's profile and roles |

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
| POST | `/api/internal/installer-keys/increment-usage/{keyId}` | TenantAdministrator or InstallerKeyManager | Increment usage counter |
| PUT | `/api/internal/installer-keys/rename` | TenantAdministrator or InstallerKeyManager | Rename an installer key |

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
| GET | `/api/internal/public-registration-settings` | None | Get whether public registration is enabled |

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

### AgentHub (`/hubs/agent`)

Agents connect to this hub to register, send updates, and receive commands.

**Client methods (called by server on agent):**
- `ReceiveDeviceUpdate`: Device state changed
- `CreateDirectory`: Create directory command
- `DeleteFile`: Delete file command
- `UploadFileToViewer`: Start file download
- `StreamDirectoryContents`: Stream directory
- `StreamFileContents`: Stream file content
- `StreamSubdirectories`: Stream subdirectories
- `ReceiveChatResponse`: Chat response
- `ReceiveTerminalOutput`: Terminal output
- `ReceivePowerStateChange`: Power state change
- `ReceiveAgentUpdateTrigger`: Trigger agent update check
- `UninstallAgent`: Uninstall agent command
- `CloseChatSession`: Close chat session

**Server methods (called by agent):**
- `UpdateDevice` / `UpdateDeviceSigned`: Update device info
- `SendDesktopPreviewStream`: Stream desktop preview
- `SendDirectoryContentsStream`: Stream directory
- `SendFileContentStream`: Stream file content
- `SendSubdirectoriesStream`: Stream subdirectories
- `SendChatResponse`: Forward chat response
- `SendTerminalOutputToViewer`: Forward terminal output

### ViewerHub (`/hubs/viewer`)

Authenticated viewers connect to this hub for device control.

**Server methods (called by viewer):**
- `RequestRemoteControlSession`: Start remote control
- `RequestVncSession`: Start VNC session
- `RequestRemoteControlPermission`: Request permission
- `UploadFile`: Upload file to device
- `SendTerminalInput`: Send terminal input
- `CreateTerminalSession`: Create terminal session
- `CloseTerminalSession`: Close terminal session
- `SendChatMessage`: Send chat message
- `SendChatResponse`: Forward chat response
- `SendDtoToAgent`: Send generic DTO to agent
- `SendDtoToUserGroups`: Send DTO to user groups
- `SendAgentUpdateTrigger`: Trigger agent update
- `SendPowerStateChange`: Power state change
- `SendWakeDevice`: Wake-on-LAN
- `UninstallAgent`: Remote uninstall
- `RefreshDeviceInfo`: Refresh device info
- `InvokeCtrlAltDel`: Invoke Ctrl+Alt+Del (Windows)
- `CloseChatSession`: Close chat session
- `TestVncConnection`: Test VNC connection
- `GetActiveDesktopSessions`: Get Windows desktop sessions
- `GetPwshCompletions`: PowerShell completions

## Next

- **[NuGet Packages](/docs/api-reference/nuget-packages)**: API client and viewer packages
- **[Scalar API Browser](/docs/scalar-api-browser)**: Interactive API exploration
- **[API Overview](/docs/api/overview)**: API structure and conventions
