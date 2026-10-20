---
sidebar_position: 12
title: Tenant Settings
---

## Overview

Tenant Settings (`/tenant-settings`) configure tenant-wide behavior. The page and its sidebar link require the `tenant.settings.read` permission. Changing a setting requires `tenant.settings.write`. Without it the page renders in a read-only state, with every control disabled.

The page exposes three settings. Changes are saved as soon as you make them. Each setting can be cleared to return to its default.

| Setting | Type | Default |
|---------|------|---------|
| `notify-user-on-session-start` | three-state (use account setting / on / off) | unset, meaning use account setting |
| `append-instance-id` | on/off | off |
| `instance-id` | text | unset |

## Default Notification Policy

Section heading: **Show Notification to User**. This controls whether the remote user is notified when a remote control session starts on their machine. It has no effect on VNC relay connections. A VNC session produces no notification under any setting here.

| Option | Behavior |
|--------|----------|
| **Use individual account setting** | Each user's own preference, from their user Settings page, decides. That personal preference defaults to on. |
| **Always notify users** | Every remote control session notifies, regardless of personal preferences. |
| **Never notify users** | No remote control session notifies, regardless of personal preferences. |

A value set here overrides individual preferences outright. Choosing **Use individual account setting** clears the tenant value, so the per-user preference decides again.

## Instance ID

The instance ID separates multiple ControlR agent installations on one machine. Each instance installs to its own directory, under its own service name and IPC channel. It does not appear in the device name. The device name is always the machine's own computer name.

### Append instance ID to agent installations

This checkbox controls whether the install scripts on the [Deploy](/docs/user-guide/deploy) page include an instance id argument. When it is off, or has never been changed, agents install as the default instance. Turn it on when a machine may already run an agent from a different ControlR server and the two installs must not collide.

### Instance ID

The value used as the instance id in generated install scripts. Leave it empty to fall back to this server's hostname.

Validation rules:

- Empty or whitespace-only is allowed and means unset. The Deploy page then uses the server hostname.
- `default` is reserved, in any capitalization. It is the name of the built-in instance directory.
- `.` and `..` are rejected.
- Path separators are rejected.
- Allowed characters are letters, digits, period, underscore, and hyphen. Spaces and other symbols are rejected.
- Values are capped at 100 characters.

## API Shape

Settings are stored per tenant as name/value rows. Through the V1 API the same three settings travel as a JSON object with camelCase properties. A `PUT /api/v1/tenant-settings?tenantId={id}` body looks like this:

```json
{
  "appendInstanceId": true,
  "instanceId": "headquarters",
  "notifyUserOnSessionStart": null
}
```

Both boolean fields are nullable. Sending a blank or null value clears that setting back to its default.

## Next

- **[Permissions](/docs/user-guide/permissions)**: Manage permissions and access
- **[Configuration](/docs/configuration)**: Server-level configuration options
