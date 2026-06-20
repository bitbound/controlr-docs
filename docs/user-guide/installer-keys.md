---
sidebar_position: 7
title: Installer Keys
---

## Overview

Installer Keys are access tokens used during agent installation to register devices with the ControlR server. They provide a secure way to control which machines can register as agents.

## Accessing Installer Keys

1. Navigate to the **Installer Keys** page (`/installer-keys`)
2. You need either the `TenantAdministrator` or `InstallerKeyManager` role

## Managing Keys

### Creating a Key

1. Enter a friendly name for the key
2. Click **Create** to generate a new installer key
3. The key secret is shown once — copy and store it securely

### Listing Keys

All installer keys are displayed in a sortable, filterable data grid with:

| Column | Description |
|--------|-------------|
| **ID** | Unique GUID for the key |
| **Name** | Friendly name you assigned |
| **Secret** | Masked secret (full value shown only at creation) |
| **Usage Count** | Number of times this key has been used |
| **Created** | When the key was created |

### Renaming a Key

Select a key and use the rename action to update its friendly name.

### Viewing Usage History

Click on a key to view its usage history — each installation that used the key is recorded with:
- Timestamp
- Device ID
- Instance ID (if applicable)

### Deleting a Key

Delete keys that are no longer needed. This does **not** affect already-installed agents — it only prevents new registrations with that key.

## Using Installer Keys

When installing an agent, pass the installer key secret:

```bash
sudo ./ControlR.Agent.Installer install \
  --server-uri https://your-server.example.com \
  --tenant-id <tenant-guid> \
  --installer-key-secret <key-secret>
```

## Self-Registration

If `ControlR_AppOptions__AllowAgentsToSelfBootstrap` is `true`, agents can register without an installer key. In this mode, no key is required during installation.

## Key History Retention

Installer key usage history is retained for `ControlR_AppOptions__AgentInstallerKeyHistoryDays` days (default: 90). Set to `0` or below to retain history indefinitely.

## Next

- **[Deploy](/docs/user-guide/deploy)** — Generate install scripts
- **[Installation](/docs/installation)** — Complete installation guide
