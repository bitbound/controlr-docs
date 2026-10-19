---
sidebar_position: 5
title: Server Alerts
---

## Overview

Server Administrators can broadcast one banner message across the whole web interface. The banner reads from a single server-wide record, so there is only ever one alert at a time.

Use cases include planned maintenance windows, incident notifications, security advisories, and upgrade reminders.

## How the banner reaches users

The banner is not pushed to open browser tabs. The web client fetches the current alert each time an interactive page loads, then shows it. So a new or cleared alert appears for a user the next time they load or navigate to a page. It does not appear in a tab that is already open and idle.

The alert is read straight from the database. It is not served from an output cache, so a save takes effect on the next page load without a cache-expiry delay.

## Permissions

Only users with the `server.settings.write` permission can create or change the alert. That policy is server-scoped, so the permission must be granted at the Server scope.

Any authenticated user can read the current alert. There is no separate read permission.

## Setting a Server Alert

### Using the Web Interface

The controls live on the **Server Settings** page at `/server-settings`. There is a single **Server Alert** section.

1. Open **Server Settings** from the sidebar.
2. Type the alert message, pick a **Severity**, and set the three toggles.
3. Turn on **Enabled**. An alert with the switch off is saved but not shown.
4. Select **Save**. Users see it on their next page load.

There is no **Clear Alert** button. To clear the banner, delete the message text and select **Save**. An empty message means no alert.

### Using the API

The supported endpoint is `POST /api/v1/server-alert`. The older `POST /api/server-alert` still responds, but it is deprecated.

```bash
curl -X POST https://your-server/api/v1/server-alert \
  -H "x-personal-token: <tokenId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Scheduled maintenance tonight at 2 AM UTC. Expect brief interruptions.",
    "severity": "Warning",
    "isEnabled": true,
    "isDismissable": true,
    "isSticky": false
  }'
```

Send every field. The request is a single record with no defaults applied from the stored row. Omitted fields fall back to their type defaults. `severity` becomes `Information`, and the three booleans become `false`. Leaving out `isEnabled` saves the alert in a disabled state, so it never shows.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | Yes | The alert text. At most 500 characters. An empty or whitespace value means no alert |
| `severity` | string | Yes | `Information`, `Warning`, `Error`, or `Success`. Names are matched case-insensitively. The numeric form `0` to `3` is also accepted. See Severity Levels |
| `isEnabled` | bool | Yes | When `false`, the alert is saved but not shown |
| `isDismissable` | bool | Yes | When `false`, the banner shows no close button |
| `isSticky` | bool | Yes | Controls whether a user's dismissal is remembered. See below |

### Severity Levels

`severity` travels as a name. The names are `Information`, `Warning`, `Error`, and `Success`. Matching is case-insensitive, so `"Warning"` and `"warning"` both work. The numeric form is still read, so `"severity": 1` and `"severity": "Warning"` describe the same alert. Responses always use the name.

| Name | Number | Banner style |
|---|---|---|
| `Information` | `0` | Info |
| `Warning` | `1` | Warning |
| `Error` | `2` | Error |
| `Success` | `3` | Success |

## Reading the Active Alert

Any authenticated user can read the current alert:

```bash
curl https://your-server/api/v1/server-alert \
  -H "x-personal-token: <tokenId>:<secret>"
```

**Response**:

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "message": "Scheduled maintenance tonight at 2 AM UTC.",
  "severity": "Warning",
  "isDismissable": true,
  "isSticky": false,
  "isEnabled": true
}
```

The response has no `createdAt` field. `severity` is the enum name, even when the request sent a number.

The alert row is seeded by a database migration, so it normally always exists. When no alert is active, the endpoint returns `200` with an empty `message` and `isEnabled: false`, not `404`. Treat a blank `message` as "no alert." A missing row only happens if the row was deleted, which the app does not do.

## Clearing a Server Alert

Clearing means saving an empty message. The banner disappears on each user's next page load.

```bash
curl -X POST https://your-server/api/v1/server-alert \
  -H "x-personal-token: <tokenId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "",
    "severity": "Information",
    "isEnabled": false,
    "isDismissable": true,
    "isSticky": false
  }'
```

## Dismiss and sticky behavior

`isDismissable` decides whether the banner shows a close button. When `false`, users cannot dismiss it.

`isSticky` decides whether a dismissal is remembered. When `isSticky` is `false`, a dismissal is stored in that browser's local storage and the banner stays hidden for that user until the message or severity changes. When `isSticky` is `true`, dismissals are not remembered, so the banner shows again on the next load. A sticky alert still shows a close button when `isDismissable` is `true`. That dismissal just does not persist.

## Configuration

Server alerts need no configuration. There are no related environment variables or options keys. The alert lives in the single-row `ServerAlerts` table, so it is covered by a normal database backup.

## Next

- **[Configuration](/docs/configuration)**: Server configuration options
- **[Upgrading](/docs/admin/upgrading)**: How to upgrade ControlR
