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
| **Any** | Any authenticated principal (cookie, bearer, PAT, service account) |
| **Service Account** | Server-scoped service account via `x-api-key` header (V1 routes only) |
| **Permission** | Requires the named permission (e.g. `tenant.users.write`) |

Authorization is enforced through the fine-grained, scope-based permission system. The permission names shown below are the canonical identifiers; see the [Permission System](/docs/permission-system) for the full model.

---

## V1 Endpoints (S2S Automation)

All V1 routes are under `/api/v1/*`. Auth requires a server-scoped service account (`x-api-key`) or a principal holding the relevant server-scoped permissions. All tenant, user, and device identifiers must be explicit in the request. The V1 surface uses ASP.NET Core API versioning with `[ApiVersion("1")]`.

### Tenant Service Accounts (`/api/v1/tenant-service-accounts/{tenantId}`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tenant-service-accounts/{tenantId}` | `service-account.write` | Create a tenant service account |
| GET | `/api/v1/tenant-service-accounts/{tenantId}` | `service-account.read` | List tenant service accounts |
| GET | `/api/v1/tenant-service-accounts/{tenantId}/{id}` | `service-account.read` | Get a specific service account |
| PUT | `/api/v1/tenant-service-accounts/{tenantId}/{id}` | `service-account.write` | Update a service account |
| DELETE | `/api/v1/tenant-service-accounts/{tenantId}/{id}` | `service-account.write` | Delete a service account |
| POST | `/api/v1/tenant-service-accounts/{tenantId}/{id}/credentials` | `service-account.rotate-credentials` | Add a credential (returns secret once) |
| DELETE | `/api/v1/tenant-service-accounts/{tenantId}/{id}/credentials/{credId}` | `service-account.rotate-credentials` | Revoke a credential |

### Server Service Accounts (`/api/v1/server-service-accounts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/server-service-accounts` | `server.service-accounts.write` | Create a server service account |
| GET | `/api/v1/server-service-accounts` | `server.service-accounts.read` | List all server service accounts |
| GET | `/api/v1/server-service-accounts/{id}` | `server.service-accounts.read` | Get a specific service account |
| PUT | `/api/v1/server-service-accounts/{id}` | `server.service-accounts.write` | Update a service account |
| DELETE | `/api/v1/server-service-accounts/{id}` | `server.service-accounts.write` | Delete a service account |
| POST | `/api/v1/server-service-accounts/{id}/credentials` | `server.service-accounts.rotate-credentials` | Add a credential (returns secret once) |
| DELETE | `/api/v1/server-service-accounts/{id}/credentials/{credId}` | `server.service-accounts.rotate-credentials` | Revoke a credential |

### Tenants (`/api/v1/tenants`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tenants` | `server.tenants.write` | Create a tenant |
| GET | `/api/v1/tenants/{id}` | `server.tenants.read` | Get a tenant |
| PUT | `/api/v1/tenants/{id}` | `server.tenants.write` | Update a tenant |
| DELETE | `/api/v1/tenants/{id}` | `server.tenants.delete` | Delete a tenant |

### Installer Keys (`/api/v1/installer-keys`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/installer-keys` | `installer-key.write` | Create an installer key |

### Devices (`/api/v1/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/devices` | Any (device access scope) | Cross-tenant device listing |
| GET | `/api/v1/devices/{deviceId}` | `device.read` | Get a specific device (any tenant) |
| GET | `/api/v1/devices/{deviceId}/desktop-sessions` | `device.read` | Get active desktop sessions |
| GET | `/api/v1/devices/summary` | Any (device access scope) | Get device summaries |
| POST | `/api/v1/devices/search` | Any (device access scope) | Search/filter/paginate devices |
| PATCH | `/api/v1/devices/{deviceId}/alias` | `device.alias.write` | Update device alias |
| DELETE | `/api/v1/devices/{deviceId}` | `device.delete` | Delete a device |
| POST | `/api/v1/devices/delete-many` | `device.delete` | Delete multiple devices |

### Logon Tokens (`/api/v1/logon-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/logon-tokens/user` | `device.logon-token.create` | Create a user logon token |
| POST | `/api/v1/logon-tokens/external` | `device.logon-token.create` | Create an external (transient user) logon token |

---

## Internal Endpoints (`/api/internal/*`)

The Internal surface serves the Blazor WASM web UI (BFF) and device agents. These controllers assume a user context derived from the session. "Any" means any authenticated principal; device-scoped permissions are evaluated against the target device.

### Auth (`/api/internal/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/auth/change-password` | Any | Change the current user's password |
| POST | `/api/internal/auth/change-password-with-credentials` | None | Change password with email + current password (+ optional 2FA) |
| POST | `/api/internal/auth/complete-password-reset` | None | Complete a password reset using a code |
| POST | `/api/internal/auth/interactive-login` | None | Interactive bearer-token login (requires `EnableInteractiveBearerLogin`) |
| POST | `/api/internal/auth/logout` | Any | Sign out of the web UI |
| GET | `/api/internal/auth/me` | Any | Get the current user's profile, permissions, and tenant |

> Note: routes inherited from ASP.NET Core Identity use camelCase (`forgotPassword`, `manage/2fa`, etc.). Routes added by ControlR use kebab-case (`change-password`, `complete-password-reset`, `interactive-login`).

---

## Permission Assignments (`/api/internal/permission-assignments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/permission-assignments` | `tenant.permissions.read` | Get assignments for a principal |
| GET | `/api/internal/permission-assignments/catalog` | `tenant.permissions.read` | Get the permission catalog |
| GET | `/api/internal/permission-assignments/presets` | `tenant.permissions.read` | Get the permission presets |
| POST | `/api/internal/permission-assignments` | `tenant.permissions.write` | Create an assignment |
| POST | `/api/internal/permission-assignments/create-many` | `tenant.permissions.write` | Create multiple assignments |
| POST | `/api/internal/permission-assignments/presets/apply` | `tenant.permissions.write` | Apply presets to a principal |
| POST | `/api/internal/permission-assignments/replace` | `tenant.permissions.write` | Replace a principal's assignments |
| PUT | `/api/internal/permission-assignments/{assignmentId}` | `tenant.permissions.write` | Update an assignment |
| DELETE | `/api/internal/permission-assignments/{assignmentId}` | `tenant.permissions.write` | Delete an assignment |
| POST | `/api/internal/permission-assignments/delete-many` | `tenant.permissions.write` | Delete multiple assignments |

## Effective Permissions (`/api/internal/effective-permissions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/effective-permissions/query` | `tenant.permissions.read` | Evaluate whether a principal has a permission at a scope |

## Authorization Change Logs (`/api/internal/authorization-change-logs`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/authorization-change-logs` | `tenant.authorization-logs.read` / `server.authorization-logs.read` | Get authorization change log entries |

---

## Users (`/api/internal/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/users` | `tenant.users.write` | Create a new user |
| GET | `/api/internal/users` | `tenant.users.read` | List all users in tenant |
| DELETE | `/api/internal/users/{userId}` | `tenant.users.delete` | Delete a user |
| POST | `/api/internal/users/{userId}/reset-password` | `tenant.users.write` | Reset user password |
| POST | `/api/internal/users/{userId}/personal-access-tokens` | `personal-access-token.others.write` | Create PAT for a user |
| GET | `/api/internal/users/{userId}/personal-access-tokens` | `personal-access-token.others.read` | List PATs for a user |
| PUT | `/api/internal/users/{userId}/personal-access-tokens/{tokenId}` | `personal-access-token.others.write` | Update a PAT for a user |
| DELETE | `/api/internal/users/{userId}/personal-access-tokens/{tokenId}` | `personal-access-token.others.write` | Delete a PAT for a user |

## User Groups (`/api/internal/user-groups`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/user-groups` | `tenant.user-groups.write` | Create a user group |
| GET | `/api/internal/user-groups` | `tenant.user-groups.read` | List all user groups |
| GET | `/api/internal/user-groups/{userGroupId}` | `tenant.user-groups.read` | Get a specific user group |
| PUT | `/api/internal/user-groups/{userGroupId}` | `tenant.user-groups.write` | Update a user group |
| DELETE | `/api/internal/user-groups/{userGroupId}` | `tenant.user-groups.write` | Delete a user group |
| POST | `/api/internal/user-groups/{userGroupId}/members` | `user-group.assign-users` | Add members to a user group |
| DELETE | `/api/internal/user-groups/{userGroupId}/members` | `user-group.assign-users` | Remove members from a user group |

## Device Groups (`/api/internal/device-groups`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/device-groups` | `tenant.device-groups.write` | Create a device group |
| GET | `/api/internal/device-groups` | `tenant.device-groups.read` | List all device groups |
| GET | `/api/internal/device-groups/{deviceGroupId}` | `tenant.device-groups.read` | Get a specific device group |
| PUT | `/api/internal/device-groups/{deviceGroupId}` | `tenant.device-groups.write` | Update a device group |
| DELETE | `/api/internal/device-groups/{deviceGroupId}` | `tenant.device-groups.write` | Delete a device group |
| POST | `/api/internal/device-groups/{deviceGroupId}/members` | `device-group.assign-devices` | Add devices to a device group |
| DELETE | `/api/internal/device-groups/{deviceGroupId}/members` | `device-group.assign-devices` | Remove devices from a device group |

## Customers (`/api/internal/customers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/customers` | `tenant.customers.write` | Create a customer |
| GET | `/api/internal/customers` | `tenant.customers.read` | List all customers |
| GET | `/api/internal/customers/{customerId}` | `tenant.customers.read` | Get a specific customer |
| PUT | `/api/internal/customers/{customerId}` | `tenant.customers.write` | Update a customer |
| DELETE | `/api/internal/customers/{customerId}` | `tenant.customers.write` | Delete a customer |
| POST | `/api/internal/customers/{customerId}/devices` | `tenant.customers.write` | Assign devices to a customer |

## Tenant Service Accounts (`/api/internal/tenant-service-accounts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/tenant-service-accounts` | `service-account.write` | Create a tenant service account |
| GET | `/api/internal/tenant-service-accounts` | `service-account.read` | List tenant service accounts |
| GET | `/api/internal/tenant-service-accounts/{id}` | `service-account.read` | Get a specific service account |
| PUT | `/api/internal/tenant-service-accounts/{id}` | `service-account.write` | Update a service account |
| DELETE | `/api/internal/tenant-service-accounts/{id}` | `service-account.write` | Delete a service account |
| POST | `/api/internal/tenant-service-accounts/{id}/credentials` | `service-account.rotate-credentials` | Add a credential (returns secret once) |
| DELETE | `/api/internal/tenant-service-accounts/{id}/credentials/{credId}` | `service-account.rotate-credentials` | Revoke a credential |

## Server Service Accounts (`/api/internal/server-service-accounts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/server-service-accounts` | `server.service-accounts.write` | Create a server service account |
| GET | `/api/internal/server-service-accounts` | `server.service-accounts.read` | List server service accounts |
| GET | `/api/internal/server-service-accounts/{id}` | `server.service-accounts.read` | Get a specific service account |
| PUT | `/api/internal/server-service-accounts/{id}` | `server.service-accounts.write` | Update a service account |
| DELETE | `/api/internal/server-service-accounts/{id}` | `server.service-accounts.write` | Delete a service account |
| POST | `/api/internal/server-service-accounts/{id}/credentials` | `server.service-accounts.rotate-credentials` | Add a credential (returns secret once) |
| DELETE | `/api/internal/server-service-accounts/{id}/credentials/{credId}` | `server.service-accounts.rotate-credentials` | Revoke a credential |

---

## Devices (`/api/internal/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/devices` | Any (device access scope) | List all devices for the tenant |
| GET | `/api/internal/devices/{deviceId}` | `device.read` | Get a specific device |
| GET | `/api/internal/devices/summary` | Any (device access scope) | Get a summary list of all devices |
| POST | `/api/internal/devices/search` | Any (device access scope) | Search/filter/paginate devices |
| PATCH | `/api/internal/devices/{deviceId}/alias` | `device.alias.write` | Update device alias |
| DELETE | `/api/internal/devices/{deviceId}` | `device.delete` | Delete a device |
| POST | `/api/internal/devices/delete-many` | `device.delete` | Delete multiple devices |

## Tags (`/api/internal/tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/tags` | Any | List all tags |
| POST | `/api/internal/tags` | `tenant.tags.write` | Create a tag |
| PUT | `/api/internal/tags` | `tenant.tags.write` | Rename a tag |
| DELETE | `/api/internal/tags/{tagId}` | `tenant.tags.write` | Delete a tag |

## Device Tags (`/api/internal/device-tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/device-tags` | `device.tags.write` | Add a tag to a device |
| DELETE | `/api/internal/device-tags/{deviceId}/{tagId}` | `device.tags.write` | Remove a tag from a device |

---

## File System (`/api/internal/device-file-system`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/device-file-system/contents` | `device.file-system.read` | Get directory listing |
| POST | `/api/internal/device-file-system/path-segments` | `device.file-system.read` | Path segments for autocomplete |
| POST | `/api/internal/device-file-system/root-drives` | `device.file-system.read` | Get root drives |
| POST | `/api/internal/device-file-system/subdirectories` | `device.file-system.read` | Get subdirectories |
| POST | `/api/internal/device-file-system/validate-path/{deviceId}` | `device.file-system.read` | Validate a file path |
| POST | `/api/internal/device-file-system/create-directory/{deviceId}` | `device.file-system.write` | Create directory |
| POST | `/api/internal/device-file-system/upload/{deviceId}` | `device.file-system.transfer-upload` | Upload file |
| GET | `/api/internal/device-file-system/download/{deviceId}` | `device.file-system.transfer-download` | Download single file |
| POST | `/api/internal/device-file-system/download-archive/{deviceId}` | `device.file-system.transfer-download` | Download archive |
| POST | `/api/internal/device-file-system/download-archive/{deviceId}/form` | `device.file-system.transfer-download` | Download archive (form-encoded) |
| DELETE | `/api/internal/device-file-system/delete-path/{deviceId}` | `device.file-system.delete` | Delete file/directory |
| GET | `/api/internal/device-file-system/logs/{deviceId}` | `device.logs.read` | Get log files |
| GET | `/api/internal/device-file-system/logs/{deviceId}/contents` | `device.logs.read` | Get log file contents |

## Desktop Preview (`/api/internal/desktop-preview`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/desktop-preview/{deviceId}/{targetProcessId}` | `device.desktop-preview.read` | Get a JPEG preview of a process window |

## Logon Tokens (`/api/internal/logon-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/logon-tokens` | `device.logon-token.create` | Create a user logon token (returns device access URL) |

---

## Personal Access Tokens (`/api/internal/personal-access-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/personal-access-tokens` | Any (self-scoped) | Create a PAT |
| GET | `/api/internal/personal-access-tokens` | Any (self-scoped) | List own PATs |
| PUT | `/api/internal/personal-access-tokens/{id}` | Any (self-scoped) | Update a PAT |
| DELETE | `/api/internal/personal-access-tokens/{id}` | Any (self-scoped) | Delete a PAT |

## Installer Keys (`/api/internal/installer-keys`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/installer-keys` | `installer-key.write` | Create an installer key |
| GET | `/api/internal/installer-keys` | `installer-key.read` | List all installer keys |
| GET | `/api/internal/installer-keys/usages/{keyId}` | `installer-key.read` | Get usage history for a key |
| PUT | `/api/internal/installer-keys/rename` | `installer-key.write` | Rename an installer key |
| DELETE | `/api/internal/installer-keys/{id}` | `installer-key.write` | Delete an installer key |

Installer-key usage is recorded server-side when an agent installs using a key. There is no separate increment endpoint.

## Invites (`/api/internal/invites`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/invites` | `tenant.users.write` | Create an invite |
| GET | `/api/internal/invites` | `tenant.users.read` | List all invites for tenant |
| DELETE | `/api/internal/invites/{inviteId}` | `tenant.users.write` | Delete an invite |
| POST | `/api/internal/invites/accept` | None | Accept an invite (anonymous) |

## Tenant Settings (`/api/internal/tenant-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/tenant-settings` | `tenant.settings.read` | Get all tenant settings |
| GET | `/api/internal/tenant-settings/{name}` | `tenant.settings.read` | Get a specific setting |
| POST | `/api/internal/tenant-settings` | `tenant.settings.write` | Set a single setting |
| PUT | `/api/internal/tenant-settings` | `tenant.settings.write` | Set multiple settings |
| DELETE | `/api/internal/tenant-settings/{name}` | `tenant.settings.write` | Delete a setting |

## Server Settings (`/api/internal/user-server-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/user-server-settings/file-upload-max-size` | Any | Get max file upload size |
| GET | `/api/internal/user-server-settings/decommission-status` | Any | Get server decommission status |

## Server Admin (`/api/internal/server-*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/server-stats` | `server.telemetry.read` | Get server statistics |
| GET | `/api/internal/server-logs/get-aspire-url` | `server.telemetry.read` | Get Aspire Dashboard URL with auth token |
| GET | `/api/internal/server-alert` | Any | Get server-wide alert |
| POST | `/api/internal/server-alert` | `server.settings.write` | Update server alert |
| POST | `/api/internal/test-email` | `server.settings.write` | Send test email to current user |
| GET | `/api/internal/public-server-settings` | None | Get public server settings: whether public registration is enabled, and whether desktop preview is disabled |

## Deployment Options (`/api/internal/deployment-options`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/deployment-options` | `agent.install` | Get agent deployment options |
| POST | `/api/internal/deployment-options/tag-capability` | `agent.install` | Get tag capability for a deployment |

## User Preferences (`/api/internal/user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/user-preferences` | Any (self-scoped) | Get all user preferences |
| GET | `/api/internal/user-preferences/{name}` | Any (self-scoped) | Get a specific preference |
| POST | `/api/internal/user-preferences` | Any (self-scoped) | Set a preference |
| PUT | `/api/internal/user-preferences` | Any (self-scoped) | Set multiple preferences |

## Effective User Preferences (`/api/internal/effective-user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/effective-user-preferences` | Any | Get merged tenant + user preferences |

## User Storage (`/api/internal/user-storage`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/internal/user-storage` | Any (self-scoped) | Set a stored item |
| GET | `/api/internal/user-storage/{key}` | Any (self-scoped) | Get a stored item |
| DELETE | `/api/internal/user-storage/{key}` | Any (self-scoped) | Delete a stored item |

## Tenants (`/api/internal/tenants`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/tenants` | `server.tenants.read` | List all tenants on the server |

## Version (`/api/internal/version`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/internal/version/agent` | None | Get current agent version |
| GET | `/api/internal/version/server` | None | Get server assembly version |
| GET | `/api/internal/version/release-notes` | None | Get release notes |

---

## Agent Endpoints (`/api/agent/*`)

Agent endpoints are for device agent communication and are separate from the BFF and S2S surfaces. They are anonymous (no user authentication required); the agent authenticates via its installer-key credentials in the request body.

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
