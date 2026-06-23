---
sidebar_position: 5
title: Server Alerts
---

## Overview

Server Alerts allow **Server Administrators** to broadcast a message across the entire ControlR web interface. When an alert is active, it appears prominently in the UI for all authenticated users, making it useful for:

- Announcing planned maintenance windows
- Notifying users of known issues or outages
- Communicating urgent security information
- Broadcasting upgrade reminders

## Setting a Server Alert

Only users with the **Server Administrator** role can manage server alerts.

### Using the Web Interface

1. Navigate to the server admin section
2. Enter the alert message text
3. Save — the alert immediately appears for all users

### Using the API

```bash
curl -X POST https://your-server/api/server-alert \
  -H "x-personal-token: <tokenId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Scheduled maintenance tonight at 2 AM UTC. Expect brief interruptions.",
    "severity": "warning"
  }'
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The alert text displayed to all users |
| `severity` | string | No | Alert severity level (see below) |

### Severity Levels

| Level | Description | Visual Style |
|-------|-------------|-------------|
| `info` | Informational announcement | Blue |
| `warning` | Important notice (default) | Yellow/Amber |
| `error` | Critical alert | Red |

## Viewing the Active Alert

All authenticated users can see the current alert:

```bash
curl https://your-server/api/server-alert
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Scheduled maintenance tonight at 2 AM UTC.",
    "severity": "warning",
    "createdAt": "2026-06-23T10:00:00Z",
    "createdBy": "admin@example.com"
  }
}
```

If no alert is active, the response returns `null`.

## Clearing a Server Alert

### Using the Web Interface

1. Go to the server admin section
2. Click **Clear Alert** or delete the alert message
3. The alert is removed immediately for all users

### Using the API

To clear the current alert, POST an empty message:

```bash
curl -X POST https://your-server/api/server-alert \
  -H "x-personal-token: <tokenId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": ""
  }'
```

## Configuration

Server alerts are stored in the database. No additional environment variables are required to use them. The alert is served from an output cache for performance, so changes propagate quickly but may have a brief delay.

## Next

- **[Configuration](/docs/configuration)** — Server configuration options
- **[Upgrading](/docs/admin/upgrading)** — How to upgrade ControlR