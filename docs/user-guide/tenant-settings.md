---
sidebar_position: 12
title: Tenant Settings
---

## Overview

Tenant Settings (`/tenant-settings`) configure tenant-wide behavior. You need the `TenantAdministrator` role to access this page.

## Available Settings

### Default Notification Policy

Controls whether remote users are notified when a remote control session starts:

| Setting | Description |
|---------|-------------|
| **Use Account Setting** | Each user's individual notification preference |
| **Always Notify** | Always notify the remote user, regardless of their preference |
| **Never Notify** | Never notify the remote user |

### Instance ID

Configure an instance identifier for multi-server agent installations:

| Setting | Description |
|---------|-------------|
| **Instance ID** | A string identifier appended to device names. Must match `[a-zA-Z0-9-_. ]`, max 100 chars. Cannot contain `.`, `..`, or `default`. |

This is useful when you run multiple ControlR servers and want to distinguish devices from each server.

## Next

- **[Permissions](/docs/user-guide/permissions)** — Manage roles and access
- **[Configuration](/docs/configuration)** — Server-level configuration options
