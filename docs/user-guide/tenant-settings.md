---
sidebar_position: 12
title: Tenant Settings
---

## Overview

Tenant Settings (`/tenant-settings`) configure tenant-wide behavior. You need the `tenant.settings.read` permission to view this page (changing settings requires `tenant.settings.write`).

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
|---|---|
| Instance ID | A string identifier appended to device names. Allowed characters: letters, digits, hyphens, underscores, periods, and spaces; max 100 chars. Reserved values: empty, `.`, `..`, `default`. |

Use this when you run multiple ControlR servers with agents connecting to each, so devices from each server are distinguishable.

## Next

- **[Permissions](/docs/user-guide/permissions)**: Manage permissions and access
- **[Configuration](/docs/configuration)**: Server-level configuration options
