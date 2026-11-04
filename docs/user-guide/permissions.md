---
sidebar_position: 10
title: Permissions
---

## Overview

The Permissions page (`/permissions`) manages fine-grained, scope-based permission assignments. Each assignment grants or denies one permission to one principal at one scope. See the [Permission System](/docs/permission-system) for the full model.

Opening the page needs `tenant.permissions.read`. Creating, editing, or deleting assignments needs `tenant.permissions.write`. A row with the `Deny` effect additionally needs `tenant.permissions.deny`. For a row at `Server` scope, the write check is `server.permissions.write` instead of the tenant one. Assigning permissions to a server service account also needs `server.permissions.write`, whatever scope the row itself uses.

## How It Works

A permission assignment is a single row that records:

- **Principal**: who the grant applies to (a user, user group, service account, or personal access token). Logon tokens also carry grant rows, but those are created with the token rather than managed on this page.
- **Permission**: what capability is granted (e.g. `device.read`, `device.remote-control.connect`)
- **Scope**: where it applies (a device, device group, customer, user group, the whole tenant, or the whole server)
- **Effect**: `Allow` or `Deny` (an explicit deny always overrides allow)

A user's effective permissions are the union of their direct assignments plus those inherited through every user group they belong to.

Not every entry in the catalog is consulted at runtime. Nothing in the server reads `device.remote-control.elevated-desktop`, so granting or denying it changes no behavior. It still appears in the picker, and it arrives on seeded principals because it belongs to the **Device Superuser** preset.

## Managing Assignments

The Permissions page is principal-centric. Select a principal, then view and manage that principal's assignments.

1. Choose a **Principal Kind** (User, User Group, Service Account, or Personal Access Token) and search for the principal.
2. The grid lists the principal's current assignments with columns for Permission, Effect, Scope, Enabled, and Notes.
3. Use **New Assignment** to add a single grant, or **Delete Selected** to remove rows in bulk.

### Creating an Assignment

In the assignment dialog:

- **Permission**: pick from the permission catalog (shown as display name with the raw name, e.g. `device.read`). Entries that exist only at `Server` scope are hidden from callers who cannot manage server permissions.
- **Effect**: `Allow` or `Deny`.
- **Scope Kind**: the granularity of the grant, offered only at the scopes the selected permission allows: `Device`, `DeviceGroup`, `CustomerTenant` (shown as "Customer"), `UserGroup`, `Tenant`, or `Server`. The `Server` entry needs `server.permissions.write`. Even with it, `Server` is offered only for a `Deny` row, for a permission that has no `Tenant` scope, or when the principal is a server service account.
- **Scope**: the specific target. The field appears on the `Device`, `DeviceGroup`, `Customer`, and `UserGroup` scopes, and the dialog refuses to submit until one is chosen. A `Tenant` row is stored against the tenant you are working in. A `Server` row carries no target.
- **Notes (optional)**: free text for other administrators. The grid shows it behind an info icon.
- **Enabled**: turns the row off without deleting it. A disabled row grants nothing.

A row that repeats an existing assignment, same principal, permission, effect, and scope, is rejected with "An identical permission assignment already exists."

### Applying Presets

Because raw permission names are hard to reason about, ControlR provides named **presets**: curated bundles of related permissions. Select one or more presets, choose a mode, and apply them to the selected principal:

- **Merge**: writes the preset's permissions as new rows and skips any the principal already holds at that scope.
- **Replace**: deletes the principal's existing rows for the scope kinds the preset touches, then writes the preset's rows. A confirmation dialog appears first.

The current presets are:

| Preset | Purpose |
|--------|---------|
| **Server Administrator** | Full server management: tenants, server telemetry, authorization logs, server service accounts, server settings (including the server-wide alert), and permission-assignment management |
| **Tenant Administrator** | Full tenant admin: users, groups, device groups, customers, tags, permissions, installers, service accounts |
| **Device Superuser** | Full device operations: remote control, file system, terminal, power, agent updates |
| **Agent Installer** | Agent install + installer key read/write |
| **Installer Key Manager** | Installer key read/write + agent install |
| **Service Account Manager** | Service account read/write/rotate |
| **Self Service** | Read and manage your own personal access tokens (`personal-access-token.self.read`, `personal-access-token.self.write`) |

The picker lists all seven presets to anyone who can read assignments. Presets only ever write `Allow` rows, one row per permission, at that permission's broadest tenant-legal scope. Device permissions therefore land at `Tenant` scope rather than one row per device, and permissions that exist only at `Server` scope land at `Server` scope.

New interactive users get **Self Service** automatically as a baseline. An administrator applies the other presets.

## Editing Permissions from Other Pages

Permission management is consistent across principal types. The **Users**, **User Groups**, **Service Accounts**, **Server Service Accounts**, and **Personal Access Tokens** pages each have an **Edit Permissions** action that opens the same assignment panel locked to that principal.

## Related Pages

- **Effective Permissions** (`/effective-permissions`): an evaluation tool. Pick a principal (User, User Group, or Service Account), a permission, a scope kind (Server, Tenant, Device, or Device Group), and a scope, then evaluate whether access is allowed or denied. Denials include the reason.
- **User Groups** (`/user-groups`): group users so a single assignment applies to all members.
- **Device Groups** (`/device-groups`): group devices so a single assignment applies to all members.
- **Customers** (`/customers`): organize devices by customer for customer-scoped grants. To create a customer or assign devices to one, see [Customers](/docs/user-guide/devices#customers).
- **Tags** (`/tags`): device tagging for organization and filtering. Tags grant no access.

## Next

- **[Permission System](/docs/permission-system)**: The full authorization model, evaluation algorithm, and design decisions
- **[Invitations](/docs/user-guide/invitations)**: Invite users to your tenant
- **[Tenant Settings](/docs/user-guide/tenant-settings)**: Tenant-wide configuration
