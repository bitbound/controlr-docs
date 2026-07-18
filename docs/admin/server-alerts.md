---
sidebar_position: 5
title: Server Alerts
---

## Overview

Server Administrators can broadcast a single banner message across the whole web interface. The banner shows for every authenticated user until cleared.

Use cases include planned maintenance windows, incident notifications, security advisories, and upgrade reminders.

## Setting a Server Alert

Only users with the **Server Administrator** role can manage server alerts.

### Using the Web Interface

1. Navigate to the server admin section
2. Enter the alert message text
3. Save. The alert immediately appears for all users.

### Using the API

```bash
curl -X POST https://your-server/api/internal/server-alert \
  -H "x-personal-token: <tokenId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Scheduled maintenance tonight at 2 AM UTC. Expect brief interruptions.",
    "severity": "warning"
  }'
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | Yes | The alert text displayed to all users |
| `severity` | string | No | One of `info`, `warning`, `error`, or `success`. Defaults to `warning` |
| `isEnabled` | bool | No | When `false`, hides the alert from the UI without deleting it |
| `isDismissable` | bool | No | When `false`, the alert cannot be dismissed by the user |
| `isSticky` | bool | No | When `true`, the alert re-appears after page navigation |

### Severity Levels

| Level | Description |
|---|---|
| `info` | Informational announcement |
| `warning` | Important notice (default) |
| `error` | Critical alert |
| `success` | Positive confirmation (e.g., upgrade complete) |

## Viewing the Active Alert

Any authenticated user can read the current alert:

```bash
curl https://your-server/api/internal/server-alert
```

**Response** (`ServerAlertResponseDto`):

```json
{
  "message": "Scheduled maintenance tonight at 2 AM UTC.",
  "severity": "warning",
  "createdAt": "2026-06-23T10:00:00Z",
  "isEnabled": true,
  "isDismissable": true,
  "isSticky": false
}
```

If no alert is active, the endpoint returns `404 Not Found`.

## Clearing a Server Alert

### Using the Web Interface

1. Go to the server admin section
2. Click **Clear Alert** or delete the alert message
3. The alert is removed immediately for all users

### Using the API

To clear the current alert, POST an empty message:

```bash
curl -X POST https://your-server/api/internal/server-alert \
  -H "x-personal-token: <tokenId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": ""
  }'
```

## Configuration

Server alerts are stored in the database. No additional environment variables are required to use them. The alert is served from an output cache for performance, so changes propagate quickly but may have a brief delay.

## Next

- **[Configuration](/docs/configuration)**: Server configuration options
- **[Upgrading](/docs/admin/upgrading)**: How to upgrade ControlR