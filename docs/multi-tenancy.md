---
sidebar_position: 1
title: Multi-Tenancy
---

## Overview

ControlR supports both single-tenant and multi-tenant deployments. By default, the server is single-tenant, meaning there is one admin/tech/MSP tenant. The first user created becomes the server and tenant administrator.

## Single-Tenant Mode (Default)

In single-tenant mode:
- The first user created becomes the **Server Administrator** and **Tenant Administrator**
- Subsequent users must be explicitly created by the tenant admin
- All users share the same tenant context
- The database uses EF Core's Global Query Filters to ensure tenant data isolation

To enable single-tenant mode, ensure `ControlR_AppOptions__EnablePublicRegistration` is set to `false` (the default).

## Multi-Tenant Mode

Setting `ControlR_AppOptions__EnablePublicRegistration` to `true` allows anyone to create a new account. When a new account is created:
1. A new tenant is automatically created
2. The new user becomes the Server Administrator and Tenant Administrator of their tenant
3. Tenant data is isolated via EF Core Global Query Filters
4. Existing tenant admins cannot see or access other tenants

**Important:** In multi-tenant mode, all tenants share the same server resources. Server-level admin actions (server stats, server logs, server alerts) are only visible to the Server Administrator role.

## Tenant Isolation

ControlR uses EF Core's [Global Query Filters](https://learn.microsoft.com/en-us/ef/core/querying/filters) to isolate tenant data. Every query automatically filters by tenant, ensuring:
- Devices from one tenant are never visible to another
- Users from one tenant cannot access another tenant's data
- Tenant settings are stored separately per tenant

## Tenant-Scoped Settings

Each tenant can configure its own settings, stored in the `TenantSettings` database table:

| Setting | Type | Description |
|---------|------|-------------|
| `append-instance-id` | bool | Whether to append instance ID to device names |
| `instance-id` | string | Instance identifier string for multi-server setups |
| `notify-user-on-session-start` | bool | Whether to notify the remote user when a session starts |

These are managed through the **Tenant Settings** page (`/tenant-settings`).

## Invitations

Tenant admins can invite users to join their tenant:
1. Navigate to the **Invitations** page (`/invite`)
2. Enter the user's email address
3. The user receives an invitation link
4. The user accepts the invitation and sets a password

Invitation links are specific to the tenant and cannot be used to join a different tenant.

## Roles Across Tenants

| Role | Scope |
|------|-------|
| **Server Administrator** | Server-wide: can see server stats, logs, alerts. Cannot access other tenants' devices or users. |
| **Tenant Administrator** | Tenant-scoped: can manage users, devices, tags, invites, and tenant settings |
| **Device Superuser** | Tenant-scoped: can access all devices in the tenant |
| **Agent Installer** | Tenant-scoped: can deploy agents on new devices |
| **Installer Key Manager** | Tenant-scoped: can manage installer keys |

## Next

- **[Configuration](/docs/configuration)**: Server configuration options
- **[Authentication Guide](/docs/authentication-guide)**: All authentication methods
