---
sidebar_position: 1
title: API Endpoints
---

## Overview

This page provides a reference of all REST API endpoints in ControlR. All endpoints use the `/api/` prefix with **no versioning**.

## Authentication Requirements

| Auth Type | Description |
|-----------|-------------|
| **None** | Public endpoint, no authentication required |
| **Any Auth** | Any authentication method (cookie, bearer, PAT) |
| **Specific Roles** | Requires specific role(s) listed |

---

## Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | None | Cookie-based login |
| POST | `/api/auth/logout` | Cookie | Sign out |
| POST | `/api/auth/register` | None | User registration |
| POST | `/api/auth/interactive-login` | None | Bearer token login (2FA supported) |
| POST | `/api/auth/refresh` | None | Refresh bearer token |
| POST | `/api/auth/forgot-password` | None | Request password reset email |
| POST | `/api/auth/reset-password` | None | Reset password with code |
| POST | `/api/auth/complete-password-reset` | None | Complete password reset |
| POST | `/api/auth/confirm-email` | None | Confirm email address |
| POST | `/api/auth/resend-confirmation-email` | None | Resend confirmation email |
| POST | `/api/auth/change-password` | Any | Change password |
| POST | `/api/auth/change-password-with-credentials` | None | Change password with credentials + 2FA |
| POST | `/api/auth/manage-two-factor` | Any | Enable/disable/verify 2FA |
| GET | `/api/auth/manage-info` | Any | Get manage info |
| POST | `/api/auth/update-manage-info` | Any | Update manage info |

---

## Devices (`/api/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/devices` | Any (or installer key) | Register/install agent on a device |
| GET | `/api/devices` | Any | List all devices for the tenant |
| GET | `/api/devices/{deviceId}` | Any (resource policy) | Get a specific device |
| DELETE | `/api/devices/{deviceId}` | Any (resource policy) | Delete a device |
| PATCH | `/api/devices/{deviceId}/alias` | Any | Update device alias |
| POST | `/api/devices/search` | Any | Search/filter/paginate devices |

---

## File System (`/api/device-file-system`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/device-file-system/contents` | Any + device access | Get directory listing |
| POST | `/api/device-file-system/path-segments` | Any + device access | Path segments for autocomplete |
| POST | `/api/device-file-system/root-drives` | Any + device access | Get root drives |
| POST | `/api/device-file-system/subdirectories` | Any + device access | Get subdirectories |
| POST | `/api/device-file-system/create-directory/{deviceId}` | Any + device access | Create directory |
| POST | `/api/device-file-system/upload/{deviceId}` | Any + device access | Upload file |
| GET | `/api/device-file-system/download/{deviceId}` | Any + device access | Download single file |
| POST | `/api/device-file-system/download-archive/{deviceId}` | Any + device access | Download archive |
| POST | `/api/device-file-system/download-archive/{deviceId}/form` | Any + device access | Download archive (form-encoded) |
| DELETE | `/api/device-file-system/delete-path/{deviceId}` | Any + device access | Delete file/directory |
| GET | `/api/device-file-system/logs/{deviceId}` | Any + device access | Get log files |
| GET | `/api/device-file-system/logs/{deviceId}/contents` | Any + device access | Get log file contents |

---

## Tags (`/api/tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tags` | TenantAdministrator | Create a tag |
| GET | `/api/tags` | TenantAdministrator | List all tags |
| PUT | `/api/tags` | TenantAdministrator | Rename a tag |
| DELETE | `/api/tags/{tagId}` | TenantAdministrator | Delete a tag |

---

## User Tags (`/api/user-tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user-tags` | Any | Add a tag to a user |
| GET | `/api/user-tags` | Any | Get allowed tags |
| GET | `/api/user-tags/{userId}` | TenantAdministrator | Get tags for a specific user |
| DELETE | `/api/user-tags/{userId}/{tagId}` | TenantAdministrator | Remove tag from a user |

---

## Device Tags (`/api/device-tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/device-tags` | TenantAdministrator | Add a tag to a device |
| DELETE | `/api/device-tags/{deviceId}/{tagId}` | TenantAdministrator | Remove tag from a device |

---

## Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users` | TenantAdministrator | Create a new user |
| GET | `/api/users` | TenantAdministrator | List all users in tenant |
| GET | `/api/users/{userId}` | TenantAdministrator | Get a specific user |
| DELETE | `/api/users/{userId}` | TenantAdministrator | Delete a user |
| POST | `/api/users/{userId}/reset-password` | TenantAdministrator | Reset user password |
| POST | `/api/users/{userId}/personal-access-tokens` | TenantAdministrator | Create PAT for a user |
| GET | `/api/users/{userId}/personal-access-tokens` | TenantAdministrator | List PATs for a user |
| PUT | `/api/users/{userId}/personal-access-tokens/{tokenId}` | TenantAdministrator | Update a PAT for a user |
| DELETE | `/api/users/{userId}/personal-access-tokens/{tokenId}` | TenantAdministrator | Delete a PAT for a user |

---

## User Roles (`/api/user-roles`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user-roles` | Any | Add a role to a user |
| GET | `/api/user-roles` | Any | Get current user's roles |
| GET | `/api/user-roles/{userId}` | TenantAdministrator | Get roles for a specific user |
| DELETE | `/api/user-roles/{userId}/{roleId}` | TenantAdministrator | Remove a role from a user |

---

## Roles (`/api/roles`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/roles` | TenantAdministrator | List all roles with member user IDs |

---

## Installer Keys (`/api/installer-keys`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/installer-keys` | TenantAdministrator or InstallerKeyManager | Create an installer key |
| GET | `/api/installer-keys` | TenantAdministrator or InstallerKeyManager | List all installer keys |
| DELETE | `/api/installer-keys/{id}` | TenantAdministrator or InstallerKeyManager | Delete an installer key |
| GET | `/api/installer-keys/usages/{keyId}` | TenantAdministrator or InstallerKeyManager | Get usage history for a key |
| POST | `/api/installer-keys/increment-usage/{keyId}` | TenantAdministrator or InstallerKeyManager | Increment usage counter |
| PUT | `/api/installer-keys/rename` | TenantAdministrator or InstallerKeyManager | Rename an installer key |

---

## Personal Access Tokens (`/api/personal-access-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/personal-access-tokens` | Any | Create a PAT |
| GET | `/api/personal-access-tokens` | Any | List own PATs |
| PUT | `/api/personal-access-tokens/{id}` | Any | Update a PAT |
| DELETE | `/api/personal-access-tokens/{id}` | Any | Delete a PAT |

---

## Logon Tokens (`/api/logon-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/logon-tokens` | Any + device access | Create a logon token (returns device access URL) |

---

## Invites (`/api/invites`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/invites` | TenantAdministrator | Create an invite |
| GET | `/api/invites` | TenantAdministrator | List all invites for tenant |
| DELETE | `/api/invites/{inviteId}` | TenantAdministrator | Delete an invite |
| POST | `/api/invites/accept` | None | Accept an invite (anonymous) |

---

## Desktop Preview (`/api/desktop-preview`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/desktop-preview/{deviceId}/{targetProcessId}` | Any + device access | Get a JPEG preview of a process window |

---

## Version (`/api/version`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/version/agent` | None | Get current agent version |
| GET | `/api/version/server` | None | Get server assembly version |

---

## Agent Update (`/api/agent-update`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/agent-update/get-bundle-metadata/{runtime}` | None | Get download metadata (URLs + SHA256) for agent bundle |

---

## User Preferences (`/api/user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user-preferences` | Any | Get all user preferences |
| GET | `/api/user-preferences/{name}` | Any | Get a specific preference |
| POST | `/api/user-preferences` | Any | Set a preference |
| PUT | `/api/user-preferences` | Any | Set multiple preferences |

---

## Effective User Preferences (`/api/effective-user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/effective-user-preferences` | Any | Get merged tenant + user preferences |

---

## Tenant Settings (`/api/tenant-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tenant-settings` | Any | Get all tenant settings |
| GET | `/api/tenant-settings/{name}` | Any | Get a specific setting |
| POST | `/api/tenant-settings` | TenantAdministrator | Set a single setting |
| PUT | `/api/tenant-settings` | TenantAdministrator | Set multiple settings |
| DELETE | `/api/tenant-settings/{name}` | TenantAdministrator | Delete a setting |

---

## Server Settings (`/api/user-server-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user-server-settings/file-upload-max-size` | Any | Get max file upload size |
| GET | `/api/user-server-settings/decommission-status` | Any | Get server decommission status |

---

## Server Admin (`/api/server-*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/server-stats` | ServerAdministrator | Get server statistics |
| GET | `/api/server-logs/get-aspire-url` | ServerAdministrator | Get Aspire Dashboard URL with auth token |
| GET | `/api/server-alert` | Any | Get server-wide alert |
| POST | `/api/server-alert` | ServerAdministrator | Update server alert |
| POST | `/api/test-email` | Any | Send test email to current user |
| GET | `/api/public-registration-settings` | None | Get whether public registration is enabled |

---

## SignalR Hubs

### AgentHub (`/hubs/agent`)

Agents connect to this hub to register, send updates, and receive commands.

**Client methods (called by server on agent):**
- `ReceiveDeviceUpdate` — Device state changed
- `CreateDirectory` — Create directory command
- `DeleteFile` — Delete file command
- `UploadFileToViewer` — Start file download
- `StreamDirectoryContents` — Stream directory
- `StreamFileContents` — Stream file content
- `StreamSubdirectories` — Stream subdirectories
- `ReceiveChatResponse` — Chat response
- `ReceiveTerminalOutput` — Terminal output
- `ReceivePowerStateChange` — Power state change
- `ReceiveAgentUpdateTrigger` — Trigger agent update check
- `UninstallAgent` — Uninstall agent command
- `CloseChatSession` — Close chat session

**Server methods (called by agent):**
- `UpdateDevice` / `UpdateDeviceSigned` — Update device info
- `SendDesktopPreviewStream` — Stream desktop preview
- `SendDirectoryContentsStream` — Stream directory
- `SendFileContentStream` — Stream file content
- `SendSubdirectoriesStream` — Stream subdirectories
- `SendChatResponse` — Forward chat response
- `SendTerminalOutputToViewer` — Forward terminal output

### ViewerHub (`/hubs/viewer`)

Authenticated viewers connect to this hub for device control.

**Server methods (called by viewer):**
- `RequestRemoteControlSession` — Start remote control
- `RequestVncSession` — Start VNC session
- `RequestRemoteControlPermission` — Request permission
- `UploadFile` — Upload file to device
- `SendTerminalInput` — Send terminal input
- `CreateTerminalSession` — Create terminal session
- `CloseTerminalSession` — Close terminal session
- `SendChatMessage` — Send chat message
- `SendChatResponse` — Forward chat response
- `SendDtoToAgent` — Send generic DTO to agent
- `SendDtoToUserGroups` — Send DTO to user groups
- `SendAgentUpdateTrigger` — Trigger agent update
- `SendPowerStateChange` — Power state change
- `SendWakeDevice` — Wake-on-LAN
- `UninstallAgent` — Remote uninstall
- `RefreshDeviceInfo` — Refresh device info
- `InvokeCtrlAltDel` — Invoke Ctrl+Alt+Del (Windows)
- `CloseChatSession` — Close chat session
- `TestVncConnection` — Test VNC connection
- `GetActiveDesktopSessions` — Get Windows desktop sessions
- `GetPwshCompletions` — PowerShell completions

## Next

- **[NuGet Packages](/docs/api-reference/nuget-packages)** — API client and viewer packages
- **[Scalar API Browser](/docs/scalar-api-browser)** — Interactive API exploration
- **[API Overview](/docs/api/overview)** — API structure and conventions
