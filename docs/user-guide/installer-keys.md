---
sidebar_position: 7
title: Installer Keys
---

## Overview

Installer keys are access tokens used during agent installation. The installer registers the device with the ControlR server at install time, and the server validates the key before it creates the device record. Use keys to control which machines can register as agents.

The server stores only a one-way hash of the key secret. The secret is shown once, at creation, and cannot be retrieved afterwards.

Keys are created on the [Deploy](/docs/user-guide/deploy) page. The **Installer Keys** page (`/installer-keys`) lists existing keys, shows their usage, and lets you rename or delete them. It has no create control.

## Accessing Installer Keys

The **Installer Keys** link in the sidebar appears when you hold the `installer-key.read` permission. The page itself is gated on the same permission. Creating, deleting, and renaming keys requires `installer-key.write`, and generating a key from the Deploy page requires that permission in addition to the `agent.install` permission the Deploy page itself needs.

## Creating a Key

1. Open the Deploy page (`/deploy`)
2. On the **Create New Key** tab, pick a **Key Type**
3. Optionally enter a **Friendly Name (Optional)**
4. For **Usage-Based**, enter **Total uses allowed** (minimum 1). For **Time-Based**, set **Expiration Date** and **Expiration Time**
5. Click **Generate Key**

The new secret appears in the **Installer Key Secret** field with a copy button. Copy and store it now. The page warns that the key is not stored in the database in a reversible way and cannot be retrieved later.

### Key Types and Expiry

| Type | Expiry behavior |
|------|-----------------|
| **Usage-Based** | Expires after the chosen number of uses or after 24 hours, whichever comes first. The server sets the expiration to 24 hours after creation automatically. |
| **Time-Based** | Expires at the date and time you choose. Both are required. |
| **Persistent** | Never expires. |

When a **Usage-Based** key is exhausted or expired, or an expired **Time-Based** key is next checked, the server deletes the key. Its usage history is deleted with it.

### Reusing an Existing Key

The Deploy page also has a **Use Existing Key** tab. Pick the key from the **Select Key** list and type its secret into the **Key Secret** field, then click **Use Key**. This only works for keys whose secret you saved earlier, because the server never shows a secret again.

## Listing Keys

The grid shows these columns:

| Column | Description |
|--------|-------------|
| **Key Id** | Unique GUID for the key |
| **Friendly Name** | Optional name assigned at creation or by rename |
| **Created By** | Display name of the user who created the key |
| **Key Type** | Usage-based, time-based, or persistent |
| **Allowed Uses** | Use limit, for usage-based keys |
| **Times Used** | Number of recorded usages, within the retention window |
| **Expiration** | Expiration timestamp, where the key has one |
| **Created** | When the key was created |

There is no secret column. The secret exists only in the creation response and in whatever copy you saved.

Two filters narrow the list:

- Without the `installer-key.manage-all` permission you see only the keys you created. Server service accounts see all keys.
- Expired non-persistent keys and exhausted usage-based keys are gone from the list, because the server deletes them.

A search box filters the grid by any field, and a refresh button reloads it.

## Renaming a Key

Open the row's Actions menu and choose **Rename**. Enter the new name in the **Rename Key** dialog. Names are limited to 1 to 100 characters by the server.

## Viewing Usage History

Open the row's Actions menu and choose **Show Usages**. Each installation that used the key is recorded with:

- **Device ID**
- **Remote IP**
- **Timestamp**

Usage history is visible only to the user who created the key, or to holders of `installer-key.manage-all`.

## Deleting a Key

Delete keys from the row's Actions menu (**Delete**, with a **Confirm Delete** prompt). Deletion requires `installer-key.write`. You can delete only your own keys unless you also hold `installer-key.manage-all`.

Deleting a key removes it and its usage history. It does **not** affect already-installed agents. It only prevents new registrations with that key.

## Using Installer Keys

The installer registers the device on the server only when the command includes an installer key id. The server validates the key id and secret together before it creates anything.

```bash
sudo ./ControlR.Agent.Installer install \
  --server-uri https://your-server.example.com \
  --tenant-id <tenant-guid> \
  --installer-key-id <key-guid> \
  --installer-key-secret <key-secret>
```

Both flags are optional to the installer itself, but passing `--installer-key-secret` without `--installer-key-id` skips the registration step entirely. The agent software installs and starts, and no device appears on the server. Scripts generated by the Deploy page always include both.

## Self-Registration Without a Key

`ControlR_AppOptions__AllowAgentsToSelfBootstrap` (default `false`) does not make keys optional at install time. The device registration endpoint the installer calls always requires a valid key, and that option is not consulted there.

The option affects only the agent connection path. When enabled, an agent the server does not know can create its own device record when it connects, without presenting any key. When the agent supplies no tenant, this fallback works only on servers with exactly one tenant, and the device lands in that tenant. On multi-tenant servers the agent's configured tenant id must name an existing tenant. With the option disabled, connections from unknown devices are rejected.

## Key History Retention

Installer key usage history is retained for `ControlR_AppOptions__AgentInstallerKeyHistoryDays` days (default: 90). Set to `0` or below to retain history indefinitely. A background job prunes older usage records every 8 hours. Deleting a key, or the server's automatic removal of an expired or exhausted key, removes its usage records regardless of this setting.

## Next

- **[Deploy](/docs/user-guide/deploy)**: Generate install scripts
- **[Installation](/docs/installation)**: Complete installation guide
