---
sidebar_position: 4
title: API Endpoints
---

## Overview

ControlR's HTTP surface is split into three route roots.

| Route root | Audience | Status |
|---|---|---|
| `/api/v1/*` | Service-to-service automation and integrations | Supported |
| `/api/*` | ControlR's own Blazor front-end (BFF pattern) | Deprecated |
| `/api/agent/*` | Device agents | Agent contract, not for integrators |

### What to build against

Build against `/api/v1/*`. It is the only surface the server treats as a stable contract.

`/api/*` is the surface the ControlR web app calls. The server keeps it, and it is not the surface to integrate against. Nearly every action on it carries an `[ApiDeprecated]` attribute naming its V1 twin, and the OpenAPI document for that group marks those operations `deprecated: true` and adds an `x-replacement-route` extension. Of the 79 Internal routes, 71 are marked deprecated. The eight that are not are the six `/api/auth` routes, the form-encoded archive download the Blazor file input uses, and the anonymous invite accept. See [Internal endpoints (deprecated)](#internal-endpoints-deprecated).

Two OpenAPI documents are published, `v1` and `internal`, served from `/openapi/v1.json` and `/openapi/internal.json`. Both are gated behind `AppOptions:EnableScalarUi`, which also mounts the Scalar reference UI that lists them.

### Conventions used in the V1 tables

- **Permission** is the canonical permission name the server evaluates. It is not a policy name. A principal needs the named permission granted at the scope the row names (Server, Tenant, Device, Device group, or user group).
- **Required parameters** lists the parameters the server rejects a request over. Route parameters and `tenantId` are covered. Optional query parameters are named only where they change the response.
- `tenantId` is a query parameter unless the row says it is in the route or in the body. See [Tenant scoping](#tenant-scoping).

## Authentication

The server forwards every request to one handler based on what the request carries. It checks in this order:

1. A logon token, when the path starts with `/device-access` and the query contains `logonToken`.
2. A bearer token, only when `AppOptions:EnableInteractiveBearerLogin` is set.
3. The `x-personal-token` header.
4. The `x-api-key` header.
5. Otherwise the Identity application cookie.

| Scheme | Credential | Notes |
|---|---|---|
| Service account | `x-api-key: <credentialId>:<secret>` | Serves both server service accounts and tenant service accounts. A server service account carries no tenant claim and may address any tenant. A tenant service account carries a tenant claim and is confined to it. |
| Personal access token | `x-personal-token: <token>` | Acts as the owning user. |
| Interactive session | `.AspNetCore.Identity.Application` cookie | The web front-end. |
| Bearer token | `Authorization: Bearer <token>` | Accepted only when `AppOptions:EnableInteractiveBearerLogin` is set. It is off in the shipped `appsettings.json`. |
| Logon token | `?logonToken=` on `/device-access` | Device access links, not an API credential. |
| Anonymous | none | Marked per route below. Agent registration authenticates with installer-key credentials in the request body. |

The OpenAPI documents advertise the cookie, `x-personal-token`, and `x-api-key` schemes. The `internal` document does not attach `x-api-key` to any operation, although its scheme definition is still listed there and the dynamic scheme selector accepts that header on Internal routes.

## Authorization

Authorization is enforced by the fine-grained permission system. Names in the tables are the server's canonical permission identifiers. See the [Permission System](/docs/permission-system) for the model.

Device-scoped permissions (`device.*`) are evaluated against the target device, so a grant over one device does not carry to another. Device group and user group permissions (`device-group.*`, `user-group.*`) are evaluated against the named group.

### Tenant scoping

Most V1 actions take a `Guid tenantId`. An action-model convention adds a filter to every V1 action that takes one, and the filter answers `400` with a ProblemDetails body when the value is absent or `00000000-0000-0000-0000-000000000000`. Treat `tenantId` as required on every row that names it.

After that check, the server resolves the tenant against the caller:

- A server-scoped principal may name any tenant. That means a server service account. A signed-in user is not one of these for this check, even a user holding server-scope permissions.
- Any other principal must name the tenant in its own claim. A mismatch is answered `403`, not `404`.

Deprecated Internal routes have no such filter. They derive the tenant from the caller's claim and answer `403` for an unusable one, which is one reason a migrated caller should send the parameter explicitly.

## V1 endpoints (supported)

All V1 routes live under the literal `/api/v1/...` path. The controllers are declared as API version `1.0`, the server assumes that version when a request does not state one, and the path segment is what selects the group. There is no separate version header to send.

31 route groups, 131 routes.

| Group | Routes | Group | Routes |
|---|---|---|---|
| [Authorization change logs](#authorization-change-logs) | 2 | [Server alert](#server-alert) | 2 |
| [Customers](#customers) | 6 | [Server logs](#server-logs) | 1 |
| [Deployment options](#deployment-options) | 2 | [Server service accounts](#server-service-accounts) | 8 |
| [Desktop preview](#desktop-preview) | 1 | [Server stats](#server-stats) | 1 |
| [Device file system](#device-file-system) | 12 | [Tags](#tags) | 5 |
| [Device groups](#device-groups) | 7 | [Tenant service accounts](#tenant-service-accounts) | 8 |
| [Device tags](#device-tags) | 2 | [Tenant settings](#tenant-settings) | 5 |
| [Devices](#devices) | 8 | [Tenants](#tenants) | 5 |
| [Effective permissions](#effective-permissions) | 1 | [Test email](#test-email) | 1 |
| [Effective user preferences](#effective-user-preferences) | 1 | [User groups](#user-groups) | 7 |
| [Installer keys](#installer-keys) | 5 | [User preferences](#user-preferences) | 4 |
| [Invites](#invites) | 3 | [User server settings](#user-server-settings) | 2 |
| [Logon tokens](#logon-tokens) | 2 | [User storage](#user-storage) | 3 |
| [Permission assignments](#permission-assignments) | 10 | [Users](#users) | 8 |
| [Personal access tokens](#personal-access-tokens) | 5 | [Version](#version) | 3 |
| [Public server settings](#public-server-settings) | 1 | | |

### Authorization change logs

`/api/v1/authorization-change-logs`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/authorization-change-logs` | `tenantId` (query) | `server.authorization-logs.read` or `tenant.authorization-logs.read` |
| GET | `/api/v1/authorization-change-logs/server` | none | `server.authorization-logs.read` |

The tenant-addressed list accepts either permission. A holder of `server.authorization-logs.read` may name any tenant through `tenantId`. A holder of only `tenant.authorization-logs.read` sees their own tenant. A search filter is available as query parameters on the `AuthorizationChangeLogSearchQueryDto` binding.

The `/server` route lists the audit entries that belong to no tenant, such as server service-account edits. It takes no `tenantId` because those rows have none.

### Customers

`/api/v1/customers`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/customers` | `tenantId` (query), body | `tenant.customers.write` |
| GET | `/api/v1/customers` | `tenantId` (query) | `tenant.customers.read` |
| GET | `/api/v1/customers/{customerId}` | `customerId` (route), `tenantId` (query) | `tenant.customers.read` |
| PUT | `/api/v1/customers/{customerId}` | `customerId` (route), `tenantId` (query), body | `tenant.customers.write` |
| DELETE | `/api/v1/customers/{customerId}` | `customerId` (route), `tenantId` (query) | `tenant.customers.write` |
| POST | `/api/v1/customers/{customerId}/devices` | `customerId` (route), `tenantId` (query), body | `tenant.customers.write` |

### Deployment options

`/api/v1/deployment-options`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/deployment-options` | `tenantId` (query) | `agent.install` |
| POST | `/api/v1/deployment-options/tag-capability` | `tenantId` (query), body | `agent.install` |

### Desktop preview

`/api/v1/desktop-preview`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/desktop-preview/{deviceId}/{targetProcessId}` | `deviceId` (route), `targetProcessId` (route, int), `tenantId` (query) | `device.desktop-preview.read` |

Responds with `image/jpeg`. The route disables the server-side request timeout, so a slow device is not cut off by the server.

### Device file system

`/api/v1/device-file-system`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/device-file-system/contents` | `tenantId` (query), body | `device.file-system.read` |
| POST | `/api/v1/device-file-system/path-segments` | `tenantId` (query), body | `device.file-system.read` |
| POST | `/api/v1/device-file-system/root-drives` | `tenantId` (query), body | `device.file-system.read` |
| POST | `/api/v1/device-file-system/subdirectories` | `tenantId` (query), body | `device.file-system.read` |
| POST | `/api/v1/device-file-system/validate-path/{deviceId}` | `deviceId` (route), `tenantId` (query), body | `device.file-system.read` |
| POST | `/api/v1/device-file-system/create-directory/{deviceId}` | `deviceId` (route), `tenantId` (query), body | `device.file-system.write` |
| POST | `/api/v1/device-file-system/upload/{deviceId}` | `deviceId` (route), `tenantId` (query), multipart body | `device.file-system.transfer-upload` |
| GET | `/api/v1/device-file-system/download/{deviceId}` | `deviceId` (route), `tenantId` (query), `filePath` (query) | `device.file-system.transfer-download` |
| POST | `/api/v1/device-file-system/download-archive/{deviceId}` | `deviceId` (route), `tenantId` (query), body | `device.file-system.transfer-download` |
| DELETE | `/api/v1/device-file-system/delete-path/{deviceId}` | `deviceId` (route), `tenantId` (query), body | `device.file-system.delete` |
| GET | `/api/v1/device-file-system/logs/{deviceId}` | `deviceId` (route), `tenantId` (query) | `device.logs.read` |
| GET | `/api/v1/device-file-system/logs/{deviceId}/contents` | `deviceId` (route), `tenantId` (query), `filePath` (query) | `device.logs.read` |

The class has no per-action policy. Authentication is required on every route, and the device permission is enforced inside the file-system service for the specific operation, as listed above.

Unlike the deprecated Internal twin, V1 has no `/download-archive/{deviceId}/form` route. That route exists only for the browser form upload.

### Device groups

`/api/v1/device-groups`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/device-groups` | `tenantId` (query), body | `tenant.device-groups.write` |
| GET | `/api/v1/device-groups` | `tenantId` (query) | `tenant.device-groups.read` |
| GET | `/api/v1/device-groups/{deviceGroupId}` | `deviceGroupId` (route), `tenantId` (query) | `tenant.device-groups.read` |
| PUT | `/api/v1/device-groups/{deviceGroupId}` | `deviceGroupId` (route), `tenantId` (query), body | `tenant.device-groups.write` |
| DELETE | `/api/v1/device-groups/{deviceGroupId}` | `deviceGroupId` (route), `tenantId` (query) | `tenant.device-groups.write` |
| POST | `/api/v1/device-groups/{deviceGroupId}/members` | `deviceGroupId` (route), `tenantId` (query), body | `device-group.assign-devices` on that group |
| DELETE | `/api/v1/device-groups/{deviceGroupId}/members` | `deviceGroupId` (route), `tenantId` (query), body | `device-group.assign-devices` on that group |

### Device tags

`/api/v1/device-tags`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/device-tags` | `tenantId` (query), body | `device.tags.write` on the target device |
| DELETE | `/api/v1/device-tags/{deviceId}/{tagId}` | `deviceId` (route), `tagId` (route), `tenantId` (query) | `device.tags.write` on that device |

### Devices

`/api/v1/devices`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/devices` | none | Device access scope |
| GET | `/api/v1/devices/summary` | none | Device access scope |
| POST | `/api/v1/devices/search` | body | Device access scope |
| GET | `/api/v1/devices/{deviceId}` | `deviceId` (route) | `device.read` |
| GET | `/api/v1/devices/{deviceId}/desktop-sessions` | `deviceId` (route) | `device.read`, plus per-session desktop access |
| PATCH | `/api/v1/devices/{deviceId}/alias` | `deviceId` (route), body | `device.alias.write` |
| DELETE | `/api/v1/devices/{deviceId}` | `deviceId` (route) | `device.delete` |
| POST | `/api/v1/devices/delete-many` | body, `DeviceIds` required | `device.delete` per device |

No route in this group takes `tenantId`. These routes resolve the caller's device access scope, so a server-scoped principal sees across tenants and a tenant principal sees its own.

`GET /api/v1/devices` and `GET /api/v1/devices/summary` stream the result as a sequence rather than returning one envelope object.

`POST /api/v1/devices/delete-many` answers with both the deleted ids and the ids it refused, so check the response body instead of the status code alone.

### Effective permissions

`/api/v1/effective-permissions`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/effective-permissions/{principalId}` | `principalId` (route), `tenantId` (query), `principalKind` (query), `permissionName` (query), `scopeKind` (query), `scopeId` (query, optional) | `tenant.permissions.read` |

`principalKind` must be one of `User`, `UserGroup`, or `ServiceAccount`. Anything else is answered `400`. `permissionName` is required and capped at 150 characters. `ServiceAccount` covers tenant service accounts only, and a principal in another tenant is answered `404`, the same answer as a principal that does not exist.

There is no `POST /api/v1/effective-permissions/query`.

### Effective user preferences

`/api/v1/effective-user-preferences`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/effective-user-preferences` | `tenantId` (query) | Any authenticated principal |

Returns the effective value of each preference the calling user can hold, together with a flag saying whether the tenant enforces that preference. The current set is `NotifyUserOnSessionStart` and `IsNotifyUserOnSessionStartTenantEnforced`.

### Installer keys

`/api/v1/installer-keys`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/installer-keys` | body, `TenantId` required | `installer-key.write` |
| GET | `/api/v1/installer-keys` | `tenantId` (query) | `installer-key.read` |
| GET | `/api/v1/installer-keys/{keyId}/usages` | `keyId` (route), `tenantId` (query) | `installer-key.read` |
| PUT | `/api/v1/installer-keys/{keyId}` | `keyId` (route), `tenantId` (query), body | `installer-key.write` |
| DELETE | `/api/v1/installer-keys/{keyId}` | `keyId` (route), `tenantId` (query) | `installer-key.write` |

`POST` is the only route that returns the key secret, and it returns it once. `PUT` renames a key and answers `204`. Usage rows are recorded by the server when an agent installs with a key, and there is no endpoint that increments them.

### Invites

`/api/v1/invites`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/invites` | `tenantId` (query), body | `tenant.users.write` |
| GET | `/api/v1/invites` | `tenantId` (query) | `tenant.users.read` |
| DELETE | `/api/v1/invites/{inviteId}` | `inviteId` (route), `tenantId` (query) | `tenant.users.write` |

Accepting an invite is not part of V1. The anonymous accept route is on the deprecated surface, described below.

### Logon tokens

`/api/v1/logon-tokens`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/logon-tokens/user` | body, includes `DeviceId`, `TenantId`, `UserId` | `device.logon-token.create` on the device |
| POST | `/api/v1/logon-tokens/external` | body, includes `DeviceId`, `TenantId`, `UserCorrelationId` (required) | `device.logon-token.create` on the device |

Both routes carry the tenant in the request body rather than the query string. The `external` route creates a transient user identity from a correlation id you supply, which suits an integration that has its own account system. Both accept optional `Permissions`, `AllowedDesktopSessionIds`, `SessionCorrelationId`, and `ExpirationMinutes`.

### Permission assignments

`/api/v1/permission-assignments`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/permission-assignments` | `tenantId` (query), `principalKind` (query), `principalId` (query) | `tenant.permissions.read` |
| GET | `/api/v1/permission-assignments/catalog` | `tenantId` (query) | `tenant.permissions.read` |
| GET | `/api/v1/permission-assignments/presets` | `tenantId` (query) | `tenant.permissions.read` |
| POST | `/api/v1/permission-assignments` | `tenantId` (query), body | `tenant.permissions.write` |
| POST | `/api/v1/permission-assignments/batch` | `tenantId` (query), body, `Assignments` required and non-empty | `tenant.permissions.write` |
| POST | `/api/v1/permission-assignments/batch-delete` | `tenantId` (query), body, `AssignmentIds` required | `tenant.permissions.write` |
| POST | `/api/v1/permission-assignments/presets/apply` | `tenantId` (query), body | `tenant.permissions.write` |
| POST | `/api/v1/permission-assignments/replace` | `tenantId` (query), body | `tenant.permissions.write` |
| PUT | `/api/v1/permission-assignments/{assignmentId}` | `assignmentId` (route), `tenantId` (query), body | `tenant.permissions.write` |
| DELETE | `/api/v1/permission-assignments/{assignmentId}` | `assignmentId` (route), `tenantId` (query) | `tenant.permissions.write` |

The batch routes are `batch` and `batch-delete`. There is no `create-many` or `delete-many` route on this group.

### Personal access tokens

`/api/v1/personal-access-tokens`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/personal-access-tokens` | `tenantId` (query), body | `personal-access-token.self.write` |
| GET | `/api/v1/personal-access-tokens` | `tenantId` (query) | `personal-access-token.self.read` |
| PUT | `/api/v1/personal-access-tokens/{id}` | `id` (route), `tenantId` (query), body | `personal-access-token.self.write` |
| DELETE | `/api/v1/personal-access-tokens/{id}` | `id` (route), `tenantId` (query) | `personal-access-token.self.write` |
| POST | `/api/v1/personal-access-tokens/{id}/revoke` | `id` (route), `tenantId` (query) | `personal-access-token.self.write` |

These are self-service routes for the calling user's own tokens. Managing another user's tokens is under [Users](#users). `POST` answers `201` and `DELETE` answers `204`. `POST .../revoke` revokes a token while keeping its record for audit, and answers `200` with the updated token.

### Public server settings

`/api/v1/public-server-settings`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/public-server-settings` | none | Anonymous |

Returns `IsPublicRegistrationEnabled` and `DisableDesktopPreview`. The response is cached for 60 seconds.

### Server alert

`/api/v1/server-alert`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/server-alert` | none | Any authenticated principal |
| POST | `/api/v1/server-alert` | body | `server.settings.write` |

### Server logs

`/api/v1/server-logs`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/server-logs/get-aspire-url` | none | `server.telemetry.read` |

Reports whether the Aspire dashboard is configured, and returns its URL with an auth token.

### Server service accounts

`/api/v1/server-service-accounts`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/server-service-accounts` | body | `server.service-accounts.write` |
| GET | `/api/v1/server-service-accounts` | none | `server.service-accounts.read` |
| GET | `/api/v1/server-service-accounts/{serviceAccountId}` | `serviceAccountId` (route) | `server.service-accounts.read` |
| PUT | `/api/v1/server-service-accounts/{serviceAccountId}` | `serviceAccountId` (route), body | `server.service-accounts.write` |
| DELETE | `/api/v1/server-service-accounts/{serviceAccountId}` | `serviceAccountId` (route) | `server.service-accounts.write` |
| POST | `/api/v1/server-service-accounts/{serviceAccountId}/credentials` | `serviceAccountId` (route), body | `server.service-accounts.rotate-credentials` |
| DELETE | `/api/v1/server-service-accounts/{serviceAccountId}/credentials/{credentialId}` | route ids | `server.service-accounts.rotate-credentials` |
| DELETE | `/api/v1/server-service-accounts/{serviceAccountId}/credentials/{credentialId}/purge` | route ids | `server.service-accounts.rotate-credentials` |

No route here takes `tenantId`. A server service account belongs to no tenant. `POST .../credentials` returns the credential secret once. `DELETE .../credentials/{credentialId}` revokes it and keeps the record, and the `purge` route removes the record.

### Server stats

`/api/v1/server-stats`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/server-stats` | none | `server.telemetry.read` |

### Tags

`/api/v1/tags`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/tags` | `tenantId` (query) | Any authenticated principal, filtered by device access scope |
| GET | `/api/v1/tags/{tagId}` | `tagId` (route), `tenantId` (query) | Any authenticated principal, filtered by device access scope |
| POST | `/api/v1/tags` | `tenantId` (query), body | `tenant.tags.write` |
| PUT | `/api/v1/tags/{tagId}` | `tagId` (route), `tenantId` (query), body | `tenant.tags.write` |
| DELETE | `/api/v1/tags/{tagId}` | `tagId` (route), `tenantId` (query) | `tenant.tags.write` |

`GET /api/v1/tags` takes an optional `includeLinkedIds` query boolean, which adds the device ids linked to each tag. Renaming is `PUT` against the tag id, and V1 has no `/rename` route.

### Tenant service accounts

`/api/v1/tenant-service-accounts/{tenantId}`

The tenant id is part of the route on every route in this group.

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/tenant-service-accounts/{tenantId}` | `tenantId` (route), body | `service-account.write` |
| GET | `/api/v1/tenant-service-accounts/{tenantId}` | `tenantId` (route) | `service-account.read` |
| GET | `/api/v1/tenant-service-accounts/{tenantId}/{serviceAccountId}` | route ids | `service-account.read` |
| PUT | `/api/v1/tenant-service-accounts/{tenantId}/{serviceAccountId}` | route ids, body | `service-account.write` |
| DELETE | `/api/v1/tenant-service-accounts/{tenantId}/{serviceAccountId}` | route ids | `service-account.write` |
| POST | `/api/v1/tenant-service-accounts/{tenantId}/{serviceAccountId}/credentials` | route ids, body | `service-account.rotate-credentials` |
| DELETE | `/api/v1/tenant-service-accounts/{tenantId}/{serviceAccountId}/credentials/{credentialId}` | route ids | `service-account.rotate-credentials` |
| DELETE | `/api/v1/tenant-service-accounts/{tenantId}/{serviceAccountId}/credentials/{credentialId}/purge` | route ids | `service-account.rotate-credentials` |

An empty `tenantId` in the route is rejected by the same required-tenant filter that guards the query parameter, so it answers `400`. A non-server principal naming a tenant other than its own is answered `403`.

### Tenant settings

`/api/v1/tenant-settings`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/tenant-settings` | `tenantId` (query) | `tenant.settings.read` |
| GET | `/api/v1/tenant-settings/{settingName}` | `settingName` (route), `tenantId` (query) | `tenant.settings.read` |
| POST | `/api/v1/tenant-settings` | `tenantId` (query), body | `tenant.settings.write` |
| PUT | `/api/v1/tenant-settings` | `tenantId` (query), body | `tenant.settings.write` |
| DELETE | `/api/v1/tenant-settings/{settingName}` | `settingName` (route), `tenantId` (query) | `tenant.settings.write` |

### Tenants

`/api/v1/tenants`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/tenants` | body | `server.tenants.write` |
| GET | `/api/v1/tenants` | none | `server.tenants.read` |
| GET | `/api/v1/tenants/{tenantId}` | `tenantId` (route) | `server.tenants.read` |
| PUT | `/api/v1/tenants/{tenantId}` | `tenantId` (route), body | `server.tenants.write` |
| DELETE | `/api/v1/tenants/{tenantId}` | `tenantId` (route) | `server.tenants.delete` |

### Test email

`/api/v1/test-email`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/test-email` | none | `server.settings.write` |

Sends a test message to the email address of the calling user. A caller with no user record, such as a service account, is answered `400`.

### User groups

`/api/v1/user-groups`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/user-groups` | `tenantId` (query), body | `tenant.user-groups.write` |
| GET | `/api/v1/user-groups` | `tenantId` (query) | `tenant.user-groups.read` |
| GET | `/api/v1/user-groups/{userGroupId}` | `userGroupId` (route), `tenantId` (query) | `tenant.user-groups.read` |
| PUT | `/api/v1/user-groups/{userGroupId}` | `userGroupId` (route), `tenantId` (query), body | `tenant.user-groups.write` |
| DELETE | `/api/v1/user-groups/{userGroupId}` | `userGroupId` (route), `tenantId` (query) | `tenant.user-groups.write` |
| POST | `/api/v1/user-groups/{userGroupId}/members` | `userGroupId` (route), `tenantId` (query), body | `user-group.assign-users` on that group |
| DELETE | `/api/v1/user-groups/{userGroupId}/members` | `userGroupId` (route), `tenantId` (query), body | `user-group.assign-users` on that group |

### User preferences

`/api/v1/user-preferences`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/user-preferences` | `tenantId` (query) | Any authenticated principal, self-scoped |
| GET | `/api/v1/user-preferences/{name}` | `name` (route), `tenantId` (query) | Any authenticated principal, self-scoped |
| POST | `/api/v1/user-preferences` | `tenantId` (query), body | Any authenticated principal, self-scoped |
| PUT | `/api/v1/user-preferences` | `tenantId` (query), body | Any authenticated principal, self-scoped |

### User server settings

`/api/v1/user-server-settings`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/user-server-settings/file-upload-max-size` | none | Any authenticated principal |
| GET | `/api/v1/user-server-settings/decommission-status` | none | Any authenticated principal |

Responses are cached for 30 seconds. Neither route takes `tenantId`, because both report server configuration.

### User storage

`/api/v1/user-storage`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/user-storage` | `tenantId` (query), body | Any authenticated principal, self-scoped |
| GET | `/api/v1/user-storage/{key}` | `key` (route), `tenantId` (query) | Any authenticated principal, self-scoped |
| DELETE | `/api/v1/user-storage/{key}` | `key` (route), `tenantId` (query) | Any authenticated principal, self-scoped |

### Users

`/api/v1/users`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| POST | `/api/v1/users` | `tenantId` (query), body | `tenant.users.write` |
| GET | `/api/v1/users` | `tenantId` (query) | `tenant.users.read` |
| DELETE | `/api/v1/users/{userId}` | `userId` (route), `tenantId` (query) | `tenant.users.delete` |
| POST | `/api/v1/users/{userId}/reset-password` | `userId` (route), `tenantId` (query) | `tenant.users.write` |
| POST | `/api/v1/users/{userId}/personal-access-tokens` | `userId` (route), `tenantId` (query), body | `personal-access-token.others.write` |
| GET | `/api/v1/users/{userId}/personal-access-tokens` | `userId` (route), `tenantId` (query) | `personal-access-token.others.read` |
| PUT | `/api/v1/users/{userId}/personal-access-tokens/{tokenId}` | route ids, `tenantId` (query), body | `personal-access-token.others.write` |
| DELETE | `/api/v1/users/{userId}/personal-access-tokens/{tokenId}` | route ids, `tenantId` (query) | `personal-access-token.others.write` |

There is no V1 route that updates a user's display name or roles. Creating a user can grant initial permissions through the request body, and permission changes after that go through [Permission assignments](#permission-assignments).

### Version

`/api/v1/version`

| Method | Path | Required parameters | Permission |
|---|---|---|---|
| GET | `/api/v1/version/agent` | none | Anonymous |
| GET | `/api/v1/version/server` | none | Anonymous |
| GET | `/api/v1/version/release-notes` | none | Anonymous |

Responses are cached for 60 seconds.

---

## Internal endpoints (deprecated)

This is the surface ControlR's own Blazor front-end calls. It is documented so you can recognize it, migrate off it, and read the front-end's traffic. Do not build new integrations on it.

Three things about it matter when you move to V1:

- These routes take the tenant from the caller's own tenant claim, so they have no `tenantId` parameter. V1 requires one.
- Deprecated actions carry `[ApiDeprecated]`. The `internal` OpenAPI document marks each `deprecated: true` and names the V1 route in `x-replacement-route`. 71 of the 79 routes carry it.
- Failure shapes differ. V1 answers every failure with an RFC 9457 ProblemDetails body, while several Internal routes answer some failures with a bare string.

79 routes, 22 controllers. Where the replacement column says a query parameter is required, add it to the V1 route.

### Auth (`/api/auth`)

Not deprecated. There is no V1 twin, because these routes exist to establish a browser session.

| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/change-password` | Any authenticated principal |
| POST | `/api/auth/change-password-with-credentials` | Anonymous, rate limited |
| POST | `/api/auth/complete-password-reset` | Anonymous, rate limited |
| POST | `/api/auth/interactive-login` | Anonymous, rate limited. Answers `404` unless `EnableInteractiveBearerLogin` is set |
| POST | `/api/auth/logout` | Any authenticated principal |
| GET | `/api/auth/me` | Any authenticated principal |

The framework's own `MapIdentityApi` set is mounted under the same `/api/auth` prefix, and only when `AppOptions:EnableInteractiveBearerLogin` is set. That flag is `false` in the shipped `appsettings.json`, so a production server maps none of these. When it is on, the mounted set is the framework's list, which is camelCase where ControlR's own routes are kebab-case:

`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/confirmEmail`, `POST /api/auth/resendConfirmationEmail`, `POST /api/auth/forgotPassword`, `POST /api/auth/resetPassword`, `POST /api/auth/manage/2fa`, `GET /api/auth/manage/info`, `POST /api/auth/manage/info`.

`POST /api/auth/register` is intercepted by ControlR. It creates the user through the same path the web UI uses, and answers `404` when public registration is disabled in server settings.

### Devices (`/api/devices`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/devices` | `/api/v1/devices` |
| GET | `/api/devices/summary` | `/api/v1/devices/summary` |
| POST | `/api/devices/search` | `/api/v1/devices/search` |
| GET | `/api/devices/{deviceId}` | `/api/v1/devices/{deviceId}` |
| PATCH | `/api/devices/{deviceId}/alias` | `/api/v1/devices/{deviceId}/alias` |
| DELETE | `/api/devices/{deviceId}` | `/api/v1/devices/{deviceId}` |
| POST | `/api/devices/delete-many` | `/api/v1/devices/delete-many` |

The V1 search and delete-many routes evaluate device access per candidate rather than pre-filtering by the caller's tenant claim, so they also work for server-scoped principals. The V1 delete-many reports refused ids in the body instead of dropping them silently.

### Device file system (`/api/device-file-system`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/device-file-system/contents` | `/api/v1/device-file-system/contents?tenantId={tenantId}` |
| POST | `/api/device-file-system/path-segments` | `/api/v1/device-file-system/path-segments?tenantId={tenantId}` |
| POST | `/api/device-file-system/root-drives` | `/api/v1/device-file-system/root-drives?tenantId={tenantId}` |
| POST | `/api/device-file-system/subdirectories` | `/api/v1/device-file-system/subdirectories?tenantId={tenantId}` |
| POST | `/api/device-file-system/validate-path/{deviceId}` | `/api/v1/device-file-system/validate-path/{deviceId}?tenantId={tenantId}` |
| POST | `/api/device-file-system/create-directory/{deviceId}` | `/api/v1/device-file-system/create-directory/{deviceId}?tenantId={tenantId}` |
| POST | `/api/device-file-system/upload/{deviceId}` | `/api/v1/device-file-system/upload/{deviceId}?tenantId={tenantId}` |
| GET | `/api/device-file-system/download/{deviceId}` | `/api/v1/device-file-system/download/{deviceId}?tenantId={tenantId}` |
| POST | `/api/device-file-system/download-archive/{deviceId}` | `/api/v1/device-file-system/download-archive/{deviceId}?tenantId={tenantId}` |
| POST | `/api/device-file-system/download-archive/{deviceId}/form` | none |
| DELETE | `/api/device-file-system/delete-path/{deviceId}` | `/api/v1/device-file-system/delete-path/{deviceId}?tenantId={tenantId}` |
| GET | `/api/device-file-system/logs/{deviceId}` | `/api/v1/device-file-system/logs/{deviceId}?tenantId={tenantId}` |
| GET | `/api/device-file-system/logs/{deviceId}/contents` | `/api/v1/device-file-system/logs/{deviceId}/contents?tenantId={tenantId}` |

The `form` route has no replacement. It exists for the browser's form-encoded upload in the web front-end. Where the V1 route names the device in the path, its request body does not repeat a device id.

### Desktop preview (`/api/desktop-preview`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/desktop-preview/{deviceId}/{targetProcessId}` | `/api/v1/desktop-preview/{deviceId}/{targetProcessId}?tenantId={tenantId}` |

### Device tags (`/api/device-tags`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/device-tags` | `/api/v1/device-tags?tenantId={tenantId}` |
| DELETE | `/api/device-tags/{deviceId}/{tagId}` | `/api/v1/device-tags/{deviceId}/{tagId}?tenantId={tenantId}` |

### Effective user preferences (`/api/effective-user-preferences`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/effective-user-preferences` | `/api/v1/effective-user-preferences?tenantId={tenantId}` |

### Installer keys (`/api/installer-keys`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/installer-keys` | `/api/v1/installer-keys`, with `TenantId` in the body |
| GET | `/api/installer-keys` | `/api/v1/installer-keys?tenantId={tenantId}` |
| GET | `/api/installer-keys/usages/{keyId}` | `/api/v1/installer-keys/{keyId}/usages?tenantId={tenantId}` |
| PUT | `/api/installer-keys/rename` | `/api/v1/installer-keys/{keyId}?tenantId={tenantId}`, body carries only `friendlyName`, answers `204` |
| DELETE | `/api/installer-keys/{id}` | `/api/v1/installer-keys/{keyId}?tenantId={tenantId}` |

Note the two shape changes. The V1 usages route puts the id in the path before `usages`, and the V1 rename is a `PUT` against the key id rather than a fixed `/rename` path. V1 list routes also return an `Items` envelope rather than a bare array.

### Invites (`/api/invites`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/invites` | `/api/v1/invites?tenantId={tenantId}` |
| GET | `/api/invites` | `/api/v1/invites?tenantId={tenantId}` |
| DELETE | `/api/invites/{inviteId}` | `/api/v1/invites/{inviteId}?tenantId={tenantId}` |
| POST | `/api/invites/accept` | none |

`POST /api/invites/accept` is anonymous and has no V1 twin. An accepted invite signs the invitee in, so it stays on the session surface.

### Logon tokens (`/api/logon-tokens`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/logon-tokens` | `/api/v1/logon-tokens/user`, with `TenantId` in the body. Server-scoped callers use `/api/v1/logon-tokens/external` |

### Personal access tokens (`/api/personal-access-tokens`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/personal-access-tokens` | `/api/v1/personal-access-tokens?tenantId={tenantId}`, answers `201` |
| GET | `/api/personal-access-tokens` | `/api/v1/personal-access-tokens?tenantId={tenantId}` |
| PUT | `/api/personal-access-tokens/{id}` | `/api/v1/personal-access-tokens/{id}?tenantId={tenantId}` |
| DELETE | `/api/personal-access-tokens/{id}` | `/api/v1/personal-access-tokens/{id}?tenantId={tenantId}`, answers `204` |

### Tags (`/api/tags`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/tags` | `/api/v1/tags?tenantId={tenantId}` |
| POST | `/api/tags` | `/api/v1/tags?tenantId={tenantId}`, answers `201` |
| PUT | `/api/tags` | `/api/v1/tags/{tagId}?tenantId={tenantId}`, body carries only `name` |
| DELETE | `/api/tags/{tagId}` | `/api/v1/tags/{tagId}?tenantId={tenantId}` |

The V1 rename takes the tag id in the route instead of in the body.

### Tenant settings (`/api/tenant-settings`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/tenant-settings` | `/api/v1/tenant-settings?tenantId={tenantId}` |
| GET | `/api/tenant-settings/{name}` | `/api/v1/tenant-settings/{name}?tenantId={tenantId}` |
| POST | `/api/tenant-settings` | `/api/v1/tenant-settings?tenantId={tenantId}` |
| PUT | `/api/tenant-settings` | `/api/v1/tenant-settings?tenantId={tenantId}` |
| DELETE | `/api/tenant-settings/{name}` | `/api/v1/tenant-settings/{name}?tenantId={tenantId}` |

### Test email (`/api/test-email`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/test-email` | `/api/v1/test-email` |

### User preferences (`/api/user-preferences`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/user-preferences` | `/api/v1/user-preferences?tenantId={tenantId}` |
| GET | `/api/user-preferences/{name}` | `/api/v1/user-preferences/{name}?tenantId={tenantId}` |
| POST | `/api/user-preferences` | `/api/v1/user-preferences?tenantId={tenantId}` |
| PUT | `/api/user-preferences` | `/api/v1/user-preferences?tenantId={tenantId}` |

### User server settings (`/api/user-server-settings`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/user-server-settings/file-upload-max-size` | `/api/v1/user-server-settings/file-upload-max-size` |
| GET | `/api/user-server-settings/decommission-status` | `/api/v1/user-server-settings/decommission-status` |

### User storage (`/api/user-storage`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/user-storage` | `/api/v1/user-storage?tenantId={tenantId}` |
| GET | `/api/user-storage/{key}` | `/api/v1/user-storage/{key}?tenantId={tenantId}` |
| DELETE | `/api/user-storage/{key}` | `/api/v1/user-storage/{key}?tenantId={tenantId}` |

### Users (`/api/users`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| POST | `/api/users` | `/api/v1/users?tenantId={tenantId}` |
| GET | `/api/users` | `/api/v1/users?tenantId={tenantId}` |
| DELETE | `/api/users/{userId}` | `/api/v1/users/{userId}?tenantId={tenantId}` |
| POST | `/api/users/{userId}/reset-password` | `/api/v1/users/{userId}/reset-password?tenantId={tenantId}` |
| POST | `/api/users/{userId}/personal-access-tokens` | `/api/v1/users/{userId}/personal-access-tokens?tenantId={tenantId}`, answers `201` |
| GET | `/api/users/{userId}/personal-access-tokens` | `/api/v1/users/{userId}/personal-access-tokens?tenantId={tenantId}` |
| PUT | `/api/users/{userId}/personal-access-tokens/{tokenId}` | `/api/v1/users/{userId}/personal-access-tokens/{tokenId}?tenantId={tenantId}` |
| DELETE | `/api/users/{userId}/personal-access-tokens/{tokenId}` | `/api/v1/users/{userId}/personal-access-tokens/{tokenId}?tenantId={tenantId}` |

### Server administration

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/server-stats` | `/api/v1/server-stats` |
| GET | `/api/server-logs/get-aspire-url` | `/api/v1/server-logs/get-aspire-url` |
| GET | `/api/server-alert` | `/api/v1/server-alert` |
| POST | `/api/server-alert` | `/api/v1/server-alert` |
| GET | `/api/public-server-settings` | `/api/v1/public-server-settings` |

`/api/public-server-settings` is anonymous on both surfaces. Its V1 replacement adds `IsPublicRegistrationEnabled` and `DisableDesktopPreview` fields under V1 type names.

### Version (`/api/version`)

| Method | Deprecated route | V1 replacement |
|---|---|---|
| GET | `/api/version/agent` | `/api/v1/version/agent` |
| GET | `/api/version/server` | `/api/v1/version/server` |
| GET | `/api/version/release-notes` | `/api/v1/version/release-notes` |

### Groups with no Internal surface

These groups exist only under `/api/v1/`. There is no `/api/...` controller for any of them, so a route you construct there returns `404`.

- Permission assignments, including the catalog, presets, batch, and replace routes
- Effective permissions
- Authorization change logs
- User groups
- Device groups
- Customers
- Tenant service accounts
- Server service accounts
- Deployment options
- The tenants list

---

## Agent endpoints (`/api/agent/*`)

These are the HTTP calls a device agent makes. They are anonymous, and the agent authenticates with installer-key credentials. Both controllers are also mounted under a legacy root for agents that predate the `/api/agent` prefix.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/agent/devices` | Installer key in body | Register a device. `InstallerKeyId` and `InstallerKeySecret` in the body are validated, and the device inherits the key's tenant |
| POST | `/api/devices` | Installer key in body | Legacy alias of the route above |
| GET | `/api/agent/updates/get-bundle-metadata/{runtime}` | Anonymous | Download metadata for the agent bundle. `runtime` is a runtime identifier such as `win-x64` |
| GET | `/api/agent-update/get-bundle-metadata/{runtime}` | Anonymous | Legacy alias of the route above |

Responses from the bundle-metadata route are cached for 600 seconds. Everything else an agent does travels over the `AgentHub`.

---

## SignalR hubs

Two hubs are mapped: `/hubs/agent` and `/hubs/viewer`.

**Protocol.** The server registers both the MessagePack and JSON hub protocols. No ControlR client adds MessagePack, and JSON is the .NET client default, so real traffic negotiates JSON. MessagePack is offered, not used. The server registers the JSON protocol with case-insensitive property names. Contract DTOs carry `MessagePackObject` attributes, so the MessagePack path is wired on the DTO side, and a client that asks for it can work. Nothing in the shipped product asks for it.

### AgentHub (`/hubs/agent`)

The hub class carries no `[Authorize]`, so the connection is anonymous. Device identity is carried by the update payload rather than by the connection. `UpdateDeviceSigned` is the only way a device reports state; the unsigned `UpdateDevice` method was removed from the hub contract. The signed route verifies the signature against the stored key, or against the key the payload presents when the device has none yet, and rejects a stale timestamp. A payload naming a device the server has never seen is rejected as an unknown device unless `AllowAgentsToSelfBootstrap` is enabled, and self-bootstrap only works on a single-tenant server.

**Agent to server.** These are the methods the agent invokes. They are the `IAgentHub` surface, and it is the whole invokable surface of this hub.

| Method | Parameters | Returns |
|---|---|---|
| `UpdateDeviceSigned` | `SignedDto<DeviceUpdateRequestDto>` | `HubResult<DeviceResponseDto>` |
| `SendChatResponse` | `ChatResponseHubDto` | `bool` |
| `SendTerminalOutputToViewer` | `viewerConnectionId`, `TerminalOutputDto` | `void` |
| `GetFileStreamFromViewer` | `FileUploadHubDto` | `ChannelReader<byte[]>` |
| `SendDesktopPreviewStream` | `streamId`, `ChannelReader<byte[]>` | `void` |
| `SendDirectoryContentsStream` | `streamId`, `directoryExists`, `ChannelReader<FileSystemEntryDto[]>` | `void` |
| `SendFileContentStream` | `streamId`, `ChannelReader<byte[]>` | `HubResult` |
| `SendSubdirectoriesStream` | `streamId`, `ChannelReader<FileSystemEntryDto[]>` | `void` |

`UpdateDeviceSigned` is how a device reports state. The stream methods push chunked file, directory, and preview data toward the viewer that asked for it, keyed by the `streamId` the server issued.

**Server to agent.** These are `IAgentHubClient` methods. The server invokes them on the agent, so an agent implements them, and a viewer never calls them directly. A viewer's request reaches the agent through the `ViewerHub` method that relays it.

| Method | Parameters |
|---|---|
| `CloseChatSession` | `sessionId`, `targetProcessId` |
| `CloseTerminalSession` | `terminalSessionId` |
| `CreateDirectory` | `CreateDirectoryHubDto` |
| `CreateRemoteControlSession` | `RemoteControlSessionRequestDto` |
| `CreateTerminalSession` | `terminalSessionId`, `viewerConnectionId` |
| `CreateVncSession` | `VncSessionRequestDto` |
| `DeleteFile` | `FileDeleteHubDto` |
| `DownloadFileFromViewer` | `FileUploadHubDto` |
| `GetActiveDesktopSessions` | none |
| `GetLogFiles` | none |
| `GetPathSegments` | `GetPathSegmentsHubDto` |
| `GetPwshCompletions` | `PwshCompletionsRequestDto` |
| `GetRootDrives` | `GetRootDrivesRequestDto` |
| `InvokeCtrlAltDel` | `InvokeCtrlAltDelRequestDto` |
| `InvokeWakeDevice` | `WakeDeviceDto` |
| `ReceiveAgentUpdateTrigger` | none |
| `ReceivePowerStateChange` | `PowerStateChangeType` |
| `ReceiveTerminalInput` | `TerminalInputDto` |
| `RefreshDeviceInfo` | none |
| `RequestDesktopPreview` | `DesktopPreviewRequestDto` |
| `RequestRemoteControlPermission` | `targetProcessId` |
| `SendChatMessage` | `ChatMessageHubDto` |
| `StreamDirectoryContents` | `DirectoryContentsStreamRequestHubDto` |
| `StreamFileContents` | `StreamFileContentsRequestHubDto` |
| `StreamSubdirectories` | `SubdirectoriesStreamRequestHubDto` |
| `TestVncConnection` | `port` |
| `UninstallAgent` | `reason` |
| `UploadArchiveToViewer` | `FileArchiveDownloadHubDto` |
| `UploadFileToViewer` | `FileDownloadHubDto` |
| `ValidateFilePath` | `ValidateFilePathHubDto` |

### ViewerHub (`/hubs/viewer`)

The hub carries `[Authorize]`, so a viewer needs an authenticated session. Beyond that, an operation authorizes the caller against the specific device permission it needs, through one shared check. Terminal input needs `device.terminal.use`, a remote-control or VNC request needs `device.remote-control.connect` or `device.vnc-relay.connect`, a refresh needs `device.read`, and so on. A refused check comes back as a `HubResult` failure whose reason is "Forbidden." Holding the connection does not grant access to a device.

**Viewer to server.** This is the `IViewerHub` surface, 46 methods. Most of it was doubled during 2026-09 (v0.28.x). The positional-argument form became `[Obsolete]` in favor of a DTO-based `*2` method, and the device id moved inside the DTO. 21 methods carry the obsolete marker. Call the `*2` form. The obsolete form is still invokable, and several of them return a bare value where the replacement wraps the answer in `HubResult`, so a null or empty answer is ambiguous on the old form and explicit on the new one.

| Method | Status | Parameters |
|---|---|---|
| `AddViewerActivity` | Obsolete, use `AddViewerActivity2` | `activityName` |
| `AddViewerActivity2` | current | `AddViewerActivityRequestDto` |
| `CloseChatSession` | Obsolete, use `CloseChatSession2` | `deviceId`, `sessionId`, `targetProcessId` |
| `CloseChatSession2` | current | `CloseChatSessionRequestDto` |
| `CloseTerminalSession` | Obsolete, use `CloseTerminalSession2` | `deviceId`, `terminalSessionId` |
| `CloseTerminalSession2` | current | `CloseTerminalSessionRequestDto` |
| `CreateTerminalSession` | Obsolete, use `CreateTerminalSession2` | `deviceId`, `terminalSessionId` |
| `CreateTerminalSession2` | current | `CreateTerminalSessionRequestDto` |
| `DisposeDeviceAccessActivity` | current | none |
| `GetActiveDesktopSessions` | Obsolete, use `GetActiveDesktopSessions2` | `deviceId` |
| `GetActiveDesktopSessions2` | current | `GetActiveDesktopSessionsRequestDto` |
| `GetDeviceAccessPermissions` | Obsolete, use `GetDeviceAccessPermissions2` | `deviceId` |
| `GetDeviceAccessPermissions2` | current | `GetDeviceAccessPermissionsRequestDto` |
| `GetPwshCompletions` | current | `PwshCompletionsRequestDto` |
| `InvokeCtrlAltDel` | Obsolete, use `InvokeCtrlAltDel2` | `deviceId`, `targetDesktopProcessId`, `desktopSessionType` |
| `InvokeCtrlAltDel2` | current | `InvokeCtrlAltDelViewerRequestDto` |
| `RefreshDeviceInfo` | Obsolete, use `RefreshDeviceInfo2` | `deviceId` |
| `RefreshDeviceInfo2` | current | `RefreshDeviceInfoRequestDto` |
| `RequestRemoteControlPermission` | Obsolete, use `RequestRemoteControlPermission2` | `deviceId`, `targetProcessId` |
| `RequestRemoteControlPermission2` | current | `RequestRemoteControlPermissionRequestDto` |
| `RequestRemoteControlSession` | Obsolete, use `RequestRemoteControlSession2` | `deviceId`, `RemoteControlSessionRequestDto` |
| `RequestRemoteControlSession2` | current | `RemoteControlSessionRequestDto` |
| `RequestVncSession` | Obsolete, use `RequestVncSession2` | `deviceId`, `VncSessionRequestDto` |
| `RequestVncSession2` | current | `VncSessionRequestDto` |
| `SendAgentUpdateTrigger` | Obsolete, use `SendAgentUpdateTrigger2` | `deviceId` |
| `SendAgentUpdateTrigger2` | current | `SendAgentUpdateTriggerRequestDto` |
| `SendChatMessage` | Obsolete, use `SendChatMessage2` | `deviceId`, `ChatMessageHubDto` |
| `SendChatMessage2` | current | `ChatMessageHubDto` |
| `SendDtoToAgent` | current | `SendDtoToAgentRequestDto` |
| `SendPowerStateChange` | Obsolete, use `SendPowerStateChange2` | `deviceId`, `PowerStateChangeType` |
| `SendPowerStateChange2` | current | `SendPowerStateChangeRequestDto` |
| `SendTerminalInput` | Obsolete, use `SendTerminalInput2` | `deviceId`, `TerminalInputDto` |
| `SendTerminalInput2` | current | `SendTerminalInputRequestDto` |
| `SendWakeDevice` | Obsolete, use `SendWakeDevice2` | `deviceId`, `macAddresses` |
| `SendWakeDevice2` | current | `SendWakeDeviceRequestDto` |
| `StartDeviceAccessActivity` | Obsolete, use `StartDeviceAccessActivity2` | `deviceId` |
| `StartDeviceAccessActivity2` | current | `StartDeviceAccessActivityRequestDto` |
| `SubscribeToDeviceHeartbeats` | Obsolete, use `SubscribeToDeviceHeartbeats2` | `deviceIds` |
| `SubscribeToDeviceHeartbeats2` | current | `SubscribeToDeviceHeartbeatsRequestDto` |
| `TestVncConnection` | Obsolete, use `TestVncConnection2` | `deviceId`, `port` |
| `TestVncConnection2` | current | `TestVncConnectionRequestDto` |
| `UninstallAgent` | Obsolete, use `UninstallAgent2` | `deviceId`, `reason` |
| `UninstallAgent2` | current | `UninstallAgentRequestDto` |
| `UnsubscribeFromDeviceHeartbeats` | Obsolete, use `UnsubscribeFromDeviceHeartbeats2` | `deviceIds` |
| `UnsubscribeFromDeviceHeartbeats2` | current | `UnsubscribeFromDeviceHeartbeatsRequestDto` |
| `UploadFile` | current | `FileUploadMetadata`, `ChannelReader<byte[]>` |

There is no `SendDtoToUserGroups` method on this hub, in either direction. Subscribing to heartbeats is capped at 100 device ids per call.

**Server to viewer.** These are `IViewerHubClient` methods. The server pushes them to connected viewers.

| Method | Parameters |
|---|---|
| `ReceiveDeviceUpdate` | `DeviceResponseDto` |
| `ReceiveTerminalOutput` | `TerminalOutputDto` |
| `ReceiveChatResponse` | `ChatResponseHubDto` |
| `ReceiveServerStats` | `ServerStatsDto` |
| `InvokeToast` | `ToastInfo` |

---

## Route inventory

| Surface | Routes | Notes |
|---|---|---|
| V1 (`/api/v1/*`) | 131 | 31 groups |
| Internal (`/api/*`) | 79 | 22 controllers, 71 marked deprecated |
| Agent (`/api/agent/*`, plus two legacy aliases) | 4 | 2 controllers, each mounted twice |
| Identity API under `/api/auth` | 10 | Framework-provided, mapped only when `EnableInteractiveBearerLogin` is set |

Every HTTP route above traces to a route attribute on a controller or to a `HttpConstants` entry. Every hub method traces to `IAgentHub`, `IAgentHubClient`, `IViewerHub`, `IViewerHubClient`, or the hub implementation. The hub method lists are complete, and a method not named there is not invokable.
