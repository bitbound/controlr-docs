---
sidebar_position: 1
title: API Endpoints
---

## Overview

ControlR's API is split into three route roots, each serving a distinct audience:

| Route root | Audience | Contract | Versioning | Example |
|---|---|---|---|---|
| `/api/*` | Blazor Web UI (BFF), device agents | Dynamic | No | `/api/users` |
| `/api/v1/*` | S2S automation | Stable contract | Yes | `/api/v1/tenants` |
| `/api/agent/*` | Device agents (anonymous) | Dynamic | No | `/api/agent/updates` |

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

## Internal Endpoints (`/api/*`)

The Internal surface serves the Blazor WASM web UI (BFF) and device agents. These controllers assume a user context derived from the session. "Any" means any authenticated principal; device-scoped permissions are evaluated against the target device.

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/change-password` | Any | Change the current user's password |
| POST | `/api/auth/change-password-with-credentials` | None | Change password with email + current password (+ optional 2FA) |
| POST | `/api/auth/complete-password-reset` | None | Complete a password reset using a code |
| POST | `/api/auth/interactive-login` | None | Interactive bearer-token login (requires `EnableInteractiveBearerLogin`) |
| POST | `/api/auth/logout` | Any | Sign out of the web UI |
| GET | `/api/auth/me` | Any | Get the current user's profile, permissions, and tenant |

> Note: routes inherited from ASP.NET Core Identity use camelCase (`forgotPassword`, `manage/2fa`, etc.). Routes added by ControlR use kebab-case (`change-password`, `complete-password-reset`, `interactive-login`).

---

## Permission Assignments (`/api/permission-assignments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/permission-assignments` | `tenant.permissions.read` | Get assignments for a principal |
| GET | `/api/permission-assignments/catalog` | `tenant.permissions.read` | Get the permission catalog |
| GET | `/api/permission-assignments/presets` | `tenant.permissions.read` | Get the permission presets |
| POST | `/api/permission-assignments` | `tenant.permissions.write` | Create an assignment |
| POST | `/api/permission-assignments/create-many` | `tenant.permissions.write` | Create multiple assignments |
| POST | `/api/permission-assignments/presets/apply` | `tenant.permissions.write` | Apply presets to a principal |
| POST | `/api/permission-assignments/replace` | `tenant.permissions.write` | Replace a principal's assignments |
| PUT | `/api/permission-assignments/{assignmentId}` | `tenant.permissions.write` | Update an assignment |
| DELETE | `/api/permission-assignments/{assignmentId}` | `tenant.permissions.write` | Delete an assignment |
| POST | `/api/permission-assignments/delete-many` | `tenant.permissions.write` | Delete multiple assignments |

## Effective Permissions (`/api/effective-permissions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/effective-permissions/query` | `tenant.permissions.read` | Evaluate whether a principal has a permission at a scope |

## Authorization Change Logs (`/api/authorization-change-logs`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/authorization-change-logs` | `tenant.authorization-logs.read` / `server.authorization-logs.read` | Get authorization change log entries |

---

## Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users` | `tenant.users.write` | Create a new user |
| GET | `/api/users` | `tenant.users.read` | List all users in tenant |
| DELETE | `/api/users/{userId}` | `tenant.users.delete` | Delete a user |
| POST | `/api/users/{userId}/reset-password` | `tenant.users.write` | Reset user password |
| POST | `/api/users/{userId}/personal-access-tokens` | `personal-access-token.others.write` | Create PAT for a user |
| GET | `/api/users/{userId}/personal-access-tokens` | `personal-access-token.others.read` | List PATs for a user |
| PUT | `/api/users/{userId}/personal-access-tokens/{tokenId}` | `personal-access-token.others.write` | Update a PAT for a user |
| DELETE | `/api/users/{userId}/personal-access-tokens/{tokenId}` | `personal-access-token.others.write` | Delete a PAT for a user |

## User Groups (`/api/user-groups`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user-groups` | `tenant.user-groups.write` | Create a user group |
| GET | `/api/user-groups` | `tenant.user-groups.read` | List all user groups |
| GET | `/api/user-groups/{userGroupId}` | `tenant.user-groups.read` | Get a specific user group |
| PUT | `/api/user-groups/{userGroupId}` | `tenant.user-groups.write` | Update a user group |
| DELETE | `/api/user-groups/{userGroupId}` | `tenant.user-groups.write` | Delete a user group |
| POST | `/api/user-groups/{userGroupId}/members` | `user-group.assign-users` | Add members to a user group |
| DELETE | `/api/user-groups/{userGroupId}/members` | `user-group.assign-users` | Remove members from a user group |

## Device Groups (`/api/device-groups`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/device-groups` | `tenant.device-groups.write` | Create a device group |
| GET | `/api/device-groups` | `tenant.device-groups.read` | List all device groups |
| GET | `/api/device-groups/{deviceGroupId}` | `tenant.device-groups.read` | Get a specific device group |
| PUT | `/api/device-groups/{deviceGroupId}` | `tenant.device-groups.write` | Update a device group |
| DELETE | `/api/device-groups/{deviceGroupId}` | `tenant.device-groups.write` | Delete a device group |
| POST | `/api/device-groups/{deviceGroupId}/members` | `device-group.assign-devices` | Add devices to a device group |
| DELETE | `/api/device-groups/{deviceGroupId}/members` | `device-group.assign-devices` | Remove devices from a device group |

## Customers (`/api/customers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/customers` | `tenant.customers.write` | Create a customer |
| GET | `/api/customers` | `tenant.customers.read` | List all customers |
| GET | `/api/customers/{customerId}` | `tenant.customers.read` | Get a specific customer |
| PUT | `/api/customers/{customerId}` | `tenant.customers.write` | Update a customer |
| DELETE | `/api/customers/{customerId}` | `tenant.customers.write` | Delete a customer |
| POST | `/api/customers/{customerId}/devices` | `tenant.customers.write` | Assign devices to a customer |

## Tenant Service Accounts (`/api/tenant-service-accounts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tenant-service-accounts` | `service-account.write` | Create a tenant service account |
| GET | `/api/tenant-service-accounts` | `service-account.read` | List tenant service accounts |
| GET | `/api/tenant-service-accounts/{id}` | `service-account.read` | Get a specific service account |
| PUT | `/api/tenant-service-accounts/{id}` | `service-account.write` | Update a service account |
| DELETE | `/api/tenant-service-accounts/{id}` | `service-account.write` | Delete a service account |
| POST | `/api/tenant-service-accounts/{id}/credentials` | `service-account.rotate-credentials` | Add a credential (returns secret once) |
| DELETE | `/api/tenant-service-accounts/{id}/credentials/{credId}` | `service-account.rotate-credentials` | Revoke a credential |

## Server Service Accounts (`/api/server-service-accounts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/server-service-accounts` | `server.service-accounts.write` | Create a server service account |
| GET | `/api/server-service-accounts` | `server.service-accounts.read` | List server service accounts |
| GET | `/api/server-service-accounts/{id}` | `server.service-accounts.read` | Get a specific service account |
| PUT | `/api/server-service-accounts/{id}` | `server.service-accounts.write` | Update a service account |
| DELETE | `/api/server-service-accounts/{id}` | `server.service-accounts.write` | Delete a service account |
| POST | `/api/server-service-accounts/{id}/credentials` | `server.service-accounts.rotate-credentials` | Add a credential (returns secret once) |
| DELETE | `/api/server-service-accounts/{id}/credentials/{credId}` | `server.service-accounts.rotate-credentials` | Revoke a credential |

---

## Devices (`/api/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/devices` | Any (device access scope) | List all devices for the tenant |
| GET | `/api/devices/{deviceId}` | `device.read` | Get a specific device |
| GET | `/api/devices/summary` | Any (device access scope) | Get a summary list of all devices |
| POST | `/api/devices/search` | Any (device access scope) | Search/filter/paginate devices |
| PATCH | `/api/devices/{deviceId}/alias` | `device.alias.write` | Update device alias |
| DELETE | `/api/devices/{deviceId}` | `device.delete` | Delete a device |
| POST | `/api/devices/delete-many` | `device.delete` | Delete multiple devices |

## Tags (`/api/tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tags` | Any | List all tags |
| POST | `/api/tags` | `tenant.tags.write` | Create a tag |
| PUT | `/api/tags` | `tenant.tags.write` | Rename a tag |
| DELETE | `/api/tags/{tagId}` | `tenant.tags.write` | Delete a tag |

## Device Tags (`/api/device-tags`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/device-tags` | `device.tags.write` | Add a tag to a device |
| DELETE | `/api/device-tags/{deviceId}/{tagId}` | `device.tags.write` | Remove a tag from a device |

---

## File System (`/api/device-file-system`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/device-file-system/contents` | `device.file-system.read` | Get directory listing |
| POST | `/api/device-file-system/path-segments` | `device.file-system.read` | Path segments for autocomplete |
| POST | `/api/device-file-system/root-drives` | `device.file-system.read` | Get root drives |
| POST | `/api/device-file-system/subdirectories` | `device.file-system.read` | Get subdirectories |
| POST | `/api/device-file-system/validate-path/{deviceId}` | `device.file-system.read` | Validate a file path |
| POST | `/api/device-file-system/create-directory/{deviceId}` | `device.file-system.write` | Create directory |
| POST | `/api/device-file-system/upload/{deviceId}` | `device.file-system.transfer-upload` | Upload file |
| GET | `/api/device-file-system/download/{deviceId}` | `device.file-system.transfer-download` | Download single file |
| POST | `/api/device-file-system/download-archive/{deviceId}` | `device.file-system.transfer-download` | Download archive |
| POST | `/api/device-file-system/download-archive/{deviceId}/form` | `device.file-system.transfer-download` | Download archive (form-encoded) |
| DELETE | `/api/device-file-system/delete-path/{deviceId}` | `device.file-system.delete` | Delete file/directory |
| GET | `/api/device-file-system/logs/{deviceId}` | `device.logs.read` | Get log files |
| GET | `/api/device-file-system/logs/{deviceId}/contents` | `device.logs.read` | Get log file contents |

## Desktop Preview (`/api/desktop-preview`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/desktop-preview/{deviceId}/{targetProcessId}` | `device.desktop-preview.read` | Get a JPEG preview of a process window |

## Logon Tokens (`/api/logon-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/logon-tokens` | `device.logon-token.create` | Create a user logon token (returns device access URL) |

---

## Personal Access Tokens (`/api/personal-access-tokens`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/personal-access-tokens` | Any (self-scoped) | Create a PAT |
| GET | `/api/personal-access-tokens` | Any (self-scoped) | List own PATs |
| PUT | `/api/personal-access-tokens/{id}` | Any (self-scoped) | Update a PAT |
| DELETE | `/api/personal-access-tokens/{id}` | Any (self-scoped) | Delete a PAT |

## Installer Keys (`/api/installer-keys`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/installer-keys` | `installer-key.write` | Create an installer key |
| GET | `/api/installer-keys` | `installer-key.read` | List all installer keys |
| GET | `/api/installer-keys/usages/{keyId}` | `installer-key.read` | Get usage history for a key |
| PUT | `/api/installer-keys/rename` | `installer-key.write` | Rename an installer key |
| DELETE | `/api/installer-keys/{id}` | `installer-key.write` | Delete an installer key |

Installer-key usage is recorded server-side when an agent installs using a key. There is no separate increment endpoint.

## Invites (`/api/invites`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/invites` | `tenant.users.write` | Create an invite |
| GET | `/api/invites` | `tenant.users.read` | List all invites for tenant |
| DELETE | `/api/invites/{inviteId}` | `tenant.users.write` | Delete an invite |
| POST | `/api/invites/accept` | None | Accept an invite (anonymous) |

## Tenant Settings (`/api/tenant-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tenant-settings` | `tenant.settings.read` | Get all tenant settings |
| GET | `/api/tenant-settings/{name}` | `tenant.settings.read` | Get a specific setting |
| POST | `/api/tenant-settings` | `tenant.settings.write` | Set a single setting |
| PUT | `/api/tenant-settings` | `tenant.settings.write` | Set multiple settings |
| DELETE | `/api/tenant-settings/{name}` | `tenant.settings.write` | Delete a setting |

## Server Settings (`/api/user-server-settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user-server-settings/file-upload-max-size` | Any | Get max file upload size |
| GET | `/api/user-server-settings/decommission-status` | Any | Get server decommission status |

## Server Admin (`/api/server-*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/server-stats` | `server.telemetry.read` | Get server statistics |
| GET | `/api/server-logs/get-aspire-url` | `server.telemetry.read` | Get Aspire Dashboard URL with auth token |
| GET | `/api/server-alert` | Any | Get server-wide alert |
| POST | `/api/server-alert` | `server.settings.write` | Update server alert |
| POST | `/api/test-email` | `server.settings.write` | Send test email to current user |
| GET | `/api/public-server-settings` | None | Get public server settings: whether public registration is enabled, and whether desktop preview is disabled |

## Deployment Options (`/api/deployment-options`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/deployment-options` | `agent.install` | Get agent deployment options |
| POST | `/api/deployment-options/tag-capability` | `agent.install` | Get tag capability for a deployment |

## User Preferences (`/api/user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user-preferences` | Any (self-scoped) | Get all user preferences |
| GET | `/api/user-preferences/{name}` | Any (self-scoped) | Get a specific preference |
| POST | `/api/user-preferences` | Any (self-scoped) | Set a preference |
| PUT | `/api/user-preferences` | Any (self-scoped) | Set multiple preferences |

## Effective User Preferences (`/api/effective-user-preferences`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/effective-user-preferences` | Any | Get merged tenant + user preferences |

## User Storage (`/api/user-storage`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user-storage` | Any (self-scoped) | Set a stored item |
| GET | `/api/user-storage/{key}` | Any (self-scoped) | Get a stored item |
| DELETE | `/api/user-storage/{key}` | Any (self-scoped) | Delete a stored item |

## Tenants (`/api/tenants`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tenants` | `server.tenants.read` | List all tenants on the server |

## Version (`/api/version`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/version/agent` | None | Get current agent version |
| GET | `/api/version/server` | None | Get server assembly version |
| GET | `/api/version/release-notes` | None | Get release notes |

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

