---
sidebar_position: 10
title: Permissions
---

## Overview

The Permissions page (`/permissions`) manages fine-grained, scope-based permission assignments. It replaces the legacy role-based model: instead of assigning fixed roles (Server Admin, Tenant Admin, Device Superuser), you grant individual permissions to a principal at a specific scope. See the [Permission System](/docs/permission-system) for the full model.

You need the `tenant.permissions.read` permission to view the page and `tenant.permissions.write` to make changes. Server-scoped assignments additionally require `server.permissions.read` / `server.permissions.write`.

## How It Works

A permission assignment is a single row that records:

- **Principal** -- who the grant applies to (a user, user group, service account, or personal access token)
- **Permission** -- what capability is granted (e.g. `device.read`, `device.remote-control.connect`)
- **Scope** -- where it applies (a specific device, device group, customer, the whole tenant, or the whole server)
- **Effect** -- `Allow` or `Deny` (an explicit deny always overrides allow)

A user's effective permissions are the union of their direct assignments plus those inherited through every user group they belong to.

## Managing Assignments

The Permissions page is principal-centric: select a principal, then view and manage that principal's assignments.

1. Choose a **Principal Kind** (User, User Group, Service Account, or Personal Access Token) and search for the principal.
2. The grid lists the principal's current assignments with columns for Permission, Effect, Scope, Enabled, and Notes.
3. Use **New Assignment** to add a single grant, or **Delete Selected** to remove rows in bulk.

### Creating an Assignment

In the assignment dialog:

- **Permission** -- pick from the permission catalog (shown as display name with the raw name, e.g. `device.read`).
- **Effect** -- `Allow` or `Deny`.
- **Scope Kind** -- the granularity of the grant. The available kinds depend on the permission's allowed scopes: `Device`, `DeviceGroup`, `CustomerTenant` (shown as "Customer"), `UserGroup`, `Tenant`, or `Server`. The `Server` scope is only available to callers who can manage server permissions.
- **Scope** -- the specific target (device, group, customer, etc.). Required for device/group/customer/user-group scopes; not used for `Tenant` or `Server` scope.
- **Notes** -- optional admin notes.
- **Enabled** -- soft-disable flag.

### Applying Presets

Because raw permission names are hard to reason about, ControlR provides named **presets** -- curated bundles of related permissions. Select one or more presets, choose a mode, and apply them to the selected principal:

- **Merge** -- adds the preset's permissions to the principal's existing grants.
- **Replace** -- replaces the principal's grants for the affected scope kinds with the preset's permissions.

The current presets are:

| Preset | Purpose |
|--------|---------|
| **Server Administrator** | Full server-wide admin: alerts, tenants, telemetry, service accounts, cross-tenant permission management |
| **Tenant Administrator** | Full tenant admin: users, groups, device groups, customers, tags, permissions, installers, service accounts |
| **Device Superuser** | Full device operations: remote control, file system, terminal, power, agent updates |
| **Agent Installer** | Agent install + installer key read/write |
| **Installer Key Manager** | Installer key read/write + agent install |
| **Service Account Manager** | Service account read/write/rotate |

## Editing Permissions from Other Pages

Permission management is consistent across principal types. The **Users**, **User Groups**, **Service Accounts**, **Server Service Accounts**, and **Personal Access Tokens** pages each have an **Edit Permissions** action that opens the same assignment panel locked to that principal.

## Related Pages

- **Effective Permissions** (`/effective-permissions`) -- an evaluation tool: pick a principal, a permission, a scope kind, and a scope, then evaluate whether access is allowed or denied (with the deny reason).
- **User Groups** (`/user-groups`) -- group users so a single assignment applies to all members.
- **Device Groups** (`/device-groups`) -- group devices so a single assignment applies to all members.
- **Customers** (`/customers`) -- organize devices by customer for customer-scoped grants.
- **Tags** (`/tags`) -- device tagging for organization and filtering (no longer used for access control).

## Next

- **[Permission System](/docs/permission-system)**: The full authorization model, evaluation algorithm, and design decisions
- **[Invitations](/docs/user-guide/invitations)**: Invite users to your tenant
- **[Tenant Settings](/docs/user-guide/tenant-settings)**: Tenant-wide configuration
