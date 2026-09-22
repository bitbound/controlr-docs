---
sidebar_position: 7
title: Multi-Tenancy
---

## Overview

ControlR supports both single-tenant and multi-tenant deployments. Every user and every device belongs to exactly one tenant, and one server instance hosts as many tenants as its registration settings allow. There is no single-tenant mode to enable or disable. A deployment stays effectively single-tenant because nothing creates a second tenant.

Registration is controlled by two independent options, both under the `AppOptions` section:

| Option | Effect |
|---|---|
| `ControlR_AppOptions__DisableFirstUserSelfRegistration` | Turns off the one-time bootstrap path that lets the very first account sign up |
| `ControlR_AppOptions__EnablePublicRegistration` | Turns on ongoing open signup for anyone |

The server allows signup when either path is open:

```
EnablePublicRegistration || (!DisableFirstUserSelfRegistration && no users exist)
```

Both flags default to `false`, so a fresh server accepts exactly one self-registered account and then closes the door.

## First Account On A Fresh Server

When the first account is created through the open bootstrap path, it receives:

- The **Server Administrator** preset. This is the only path that grants it during self-registration, and it applies only to the first user on the server.
- The **Tenant Administrator**, **Device Superuser**, **Agent Installer**, and **Installer Key Manager** presets, because signing up creates a new tenant.
- The **Self Service** preset, which every interactive user receives.

A server administrator is a grant, not a fixed role. The `server.*` permissions in those presets are recorded at server scope, so they apply across every tenant. Everything else is recorded at the account's own tenant scope.

If you set `DisableFirstUserSelfRegistration` to `true` before any account exists, no one can bootstrap this way. Supply the `Bootstrap` configuration section instead. Setting both `AdminEmail` and `AdminPassword` (`ControlR_Bootstrap__AdminEmail` and `ControlR_Bootstrap__AdminPassword`) creates an account holding all five presets plus **Self Service**. The same section can pre-create a server-scoped service account credential and a personal access token for automation.

## Additional Accounts

With `EnablePublicRegistration` set to `true`, anyone can create an account. When a new account signs up itself:

1. A new tenant is created automatically and the account is placed in it
2. The account receives **Tenant Administrator**, **Device Superuser**, **Agent Installer**, **Installer Key Manager**, and **Self Service**
3. It does **not** receive **Server Administrator**, so it has no server-scoped reach
4. It cannot see or reach any other tenant

A later account is therefore the administrator of its own tenant, not of the server. The only accounts that ever hold server-scoped permissions are the first account, a bootstrap admin, and whoever a server administrator grants them to.

Invited users are different again. An invitation places the user in the inviter's existing tenant, and a new invitee starts with only the **Self Service** baseline.

## How A Tenant Comes To Exist

Only three paths create a tenant:

1. **Self-registration or a first external-provider sign-in.** Each creates its own tenant.
2. **The bootstrap admin account** created from the `Bootstrap` configuration section.
3. **A server administrator** calling `POST /api/v1/tenants`, which requires the `server.tenants.write` permission.

Installing an agent never creates a tenant, and neither does inviting a user.

## Tenant Isolation

ControlR uses EF Core [Global Query Filters](https://learn.microsoft.com/en-us/ef/core/querying/filters) to isolate tenant data. Each authenticated principal carries a tenant claim, `controlr:tenant:id`, and the filters compare rows against it.

This is not a blanket guarantee at the database layer, and two cases matter:

- Filters are applied only when the request's principal is authenticated **and** carries both a tenant and a user claim. A server-scoped service account has no tenant claim, so its database context has no tenant filters at all. Those paths are protected by explicit tenant predicates and permission checks in controllers and services.
- Some entities deliberately carry no filter. `PermissionAssignments` is one, because server-scoped grant rows belong to no tenant and the rule resolver must read rows without a tenant context. `ServiceAccounts`, `AuthorizationChangeLogs`, `ServerAlert`, `Tenant`, and the framework's data-protection keys are also unfiltered. Each is guarded in code rather than by a filter.

Filtered entities include devices, users, tags, customers, device groups, user groups, installer keys, logon tokens, tenant invites, and tenant settings. Personal access tokens, user preferences, and user storage items filter by the owning user first and fall back to tenant.

### How A Request Resolves Its Tenant

Deprecated internal endpoints take the tenant from the caller's claim only. The V1 surface is explicit: each action requires a `tenantId` parameter, and the server compares it against the caller's tenant claim. A mismatch is rejected. The exception is a server-kind service account, which may name any tenant. A tenant ID supplied by a client is never trusted on its own.

## Server-Level Surfaces

All tenants share the same server process and resources. The three server surfaces behave as follows:

| Surface | Requirement to read | Requirement to change |
|---|---|---|
| Server alerts | Any signed-in user | `server.settings.write` |
| Server stats | `server.telemetry.read` | n/a |
| Server logs | `server.telemetry.read` | n/a |

The alert banner is visible to every authenticated user, including tenant-only accounts. There is no `server.alerts.read` permission.

## Tenant-Scoped Settings

Each tenant can configure its own settings, stored in the `TenantSettings` database table:

| Setting | Type | Description |
|---------|------|-------------|
| `append-instance-id` | bool | Whether to append the instance ID to agent installations |
| `instance-id` | string | Instance identifier that separates several agent installs on one machine |
| `notify-user-on-session-start` | bool | Whether to notify the local user when a session starts |

These are managed through the **Tenant Settings** page (`/tenant-settings`).

## Customers

A customer is a named grouping inside a tenant, not a tenant. It sits below the tenant boundary: a tenant is the isolation and security boundary, while a customer is an organizational label that can also carry permission grants. Devices carry an optional customer reference. Tenant administrators assign devices to customers, and an agent can bind its own customer at registration only when that customer belongs to its tenant.

## Invitations

Tenant administrators invite users into their own tenant from the **Invitations** page (`/invite`). The page requires the `tenant.users.write` permission.

The mechanism is a share URL, not an email:

1. Enter an email address. Creating the invite immediately creates a user account in your tenant with a random password nobody sees, plus an activation code.
2. Copy the returned confirmation URL, which has the form `/invite-confirmation/{activationCode}`.
3. Send that URL to the person yourself. ControlR does not email invitations.
4. The invitee opens the URL while signed out, enters their email and a new password, and the server matches the pair to the pending invite.

Redemption sets the password on the account that the invite already created, moves it into the tenant, clears stale grants, and applies the **Self Service** baseline. The activation code in the URL is the only credential, so treat the URL as a secret. Deleting an invite also deletes the account it created.

Invitation URLs are tied to one tenant and cannot be redeemed into another.

## Permissions Across Tenants

Access is governed by fine-grained, scope-based permission assignments rather than fixed roles. Most policies are tenant-scoped and resolve against the caller's own tenant claim. Server-scoped permissions (for example `server.tenants.read` and `server.settings.write`) apply across all tenants and are held by few principals. Tenant-scoped permissions (for example `tenant.users.write` and `device.read`) apply within a single tenant and are managed by that tenant's administrators.

Presets bundle related permissions. Each permission in a preset is recorded at the broadest scope that its catalog entry legally permits, which puts `server.*` permissions at server scope and everything else at tenant scope. See [Permissions](/docs/user-guide/permissions) and the [Permission System](/docs/permission-system).

## Next

- **[Configuration](/docs/configuration)**: Server configuration options
- **[Authentication Guide](/docs/authentication-guide)**: All authentication methods
