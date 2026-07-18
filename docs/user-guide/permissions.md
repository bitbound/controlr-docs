---
sidebar_position: 10
title: Permissions
---

## Overview

The Permissions page (`/permissions`) manages users, device access, and tags. You need the `TenantAdministrator` role to access this page.

## Three Tabs

The page is organized into three tabs:

### Tags

Create, rename, and delete tags. Tags are used for device access control: a user needs either the `DeviceSuperuser` role or a matching tag to access a device.

| Action | Description |
|--------|-------------|
| **Create** | Add a new tag (name must match `[a-z0-9-]`, max 100 chars) |
| **Rename** | Change an existing tag's name |
| **Delete** | Remove a tag (does not affect device assignments) |

### Users

Manage users in your tenant:

| Action | Description |
|--------|-------------|
| **List** | View all users in the tenant |
| **Assign Roles** | Assign or remove roles (Server Admin, Tenant Admin, Device Superuser, Agent Installer, Installer Key Manager) |
| **Assign Tags** | Grant device access by assigning tags |
| **Reset Password** | Admin can reset a user's password |
| **Delete** | Remove a user from the tenant |

### Devices

Manage device access:

| Action | Description |
|--------|-------------|
| **List** | View all devices in the tenant |
| **Assign Tags** | Assign tags to devices for access control |
| **Remove Tags** | Remove tag assignments |

## Role Descriptions

| Role | Permissions |
|------|-------------|
| **Server Administrator** | Full server-wide admin (stats, logs, alerts, server settings) |
| **Tenant Administrator** | Manage users, devices, tags, invites, and tenant settings |
| **Device Superuser** | Access all devices in the tenant |
| **Agent Installer** | Deploy/install agents on new devices |
| **Installer Key Manager** | Create and manage installer keys |

## Next

- **[Invitations](/docs/user-guide/invitations)**: Invite users to your tenant
- **[Tenant Settings](/docs/user-guide/tenant-settings)**: Tenant-wide configuration
