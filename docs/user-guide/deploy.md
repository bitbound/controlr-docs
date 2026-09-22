---
sidebar_position: 6
title: Deploy
---

## Overview

The Deploy page (`/deploy`) generates a ready-to-run install script for each target platform. The page title is **Deploy Agent**. Each script downloads the bootstrap installer from your server and runs it with the arguments the page assembles. Supported targets are Windows x64, Windows x86, Apple Silicon macOS, Intel macOS, and Linux x64.

## Accessing Deploy

1. Navigate to the Deploy page (`/deploy`)
2. You need the `agent.install` permission to open the page
3. Generating a key from the page needs `installer-key.write` as well. The **Use Existing Key** tab lists keys, which needs `installer-key.read`. The **Customer** selector only appears with `tenant.customers.read`.

## Installer key first

The page shows no install scripts until it has an installer key secret. It opens with the message "You must first generate an installer access key or use an existing one." and two tabs. This is not a preference. Every agent registration made through the installer is checked against an installer key ID and secret on the server, so a new agent cannot register without one.

### Create New Key

| Field | Applies to |
|-------|------------|
| **Key Type** | Radio group with **Usage-Based**, **Time-Based**, and **Persistent**. Nothing is preselected, so pick one before generating |
| **Friendly Name (Optional)** | Any key type |
| **Total uses allowed** | **Usage-Based** only, minimum 1 |
| **Expiration Date**, **Expiration Time** | **Time-Based** only |

The key types behave as follows:

- **Usage-Based**: the key works for the number of installs you allow. The server also stamps an expiration 24 hours after creation. The page states the key expires after the chosen number of uses or after 24 hours, whichever comes first. Each install consumes one use.
- **Time-Based**: the key works until the date and time you set. Both values are required and must be in the future. The page pre-fills one hour from now.
- **Persistent**: the key never expires and is not consumed by use.

Click **Generate Key**. For time-based and usage-based keys, the page later repeats the expiry in an alert above the scripts.

### Use Existing Key

The key secret is stored as a hash, so the page cannot read a previous secret back for you. You have to supply it. Pick the key in **Select Key** and type the secret into **Key Secret**, then click **Use Key**. The dropdown shows each entry as `Friendly Name (KeyType) - Id`, or `Unnamed Key (KeyType) - Id` when no friendly name was set. The list contains the keys you created. With `installer-key.manage-all`, or when authenticated as a server principal, it contains every non-expired key in the tenant.

### Save the secret

The page warns once the key exists:

> **Important:** Save your installer key now if you intend to use it long-term. It is not stored in the database in a reversible way and cannot be retrieved later.

The secret appears a second time in the read-only **Installer Key Secret** field, masked, with its own copy icon. **Back to Create Key** returns to key selection and drops the current secret from the page.

## Platform tabs

Each tab produces exactly one script. There is no Command Prompt or Zsh variant.

| Tab | Script label shown above the field | What it runs | Installer download path |
|-----|-------------------------------------|--------------|--------------------------|
| **Windows x64** | **PowerShell** | One PowerShell line that downloads the installer to `$env:TEMP`, then `Start-Process ... -Verb RunAs` so the install runs elevated | `/downloads/win-x64/ControlR.Agent.Installer.exe` |
| **Windows x86** | **PowerShell** | Same shape as **Windows x64**, x86 binary | `/downloads/win-x86/ControlR.Agent.Installer.exe` |
| **Mac Apple Silicon** | **zsh** | Chained `sudo` commands that write `/tmp/ControlR.Agent.Installer`, make it executable, and run it | `/downloads/osx-arm64/ControlR.Agent.Installer` |
| **Mac Intel** | **zsh** | Same shape as **Mac Apple Silicon**, x64 binary | `/downloads/osx-x64/ControlR.Agent.Installer` |
| **Linux** | **Bash** | Same shape as the Mac tabs, x64 binary | `/downloads/linux-x64/ControlR.Agent.Installer` |

Prepend your server origin to each path. The **Linux** tab also notes that the Linux agent requires `systemd` and is regularly tested on Ubuntu, Kubuntu, and Fedora KDE running Wayland.

## Copying a script

There is no Copy Script button. Each tab shows its script in a read-only field labeled **Copy and paste to install agent**. The copy icon at the end of that field copies that tab's script to your clipboard, and a notification confirms "Install script copied to clipboard". Use the copy icon on **Installer Key Secret** when you want only the secret.

## Options

The section is labeled **Options**. It contains the following.

| Option | Description |
|--------|-------------|
| **Customer** | Optional selector that assigns the device to a customer at install time. Passed as `-c` / `--customer`. Shown only when you have `tenant.customers.read`. Changing it re-checks whether tags may be assigned. |
| **Device Tags** | Check **Add device tags**, then pick tags by name in the **Tags** multi-select. The page writes the selected tag GUIDs into `-g` / `--device-tags`, so you never type GUIDs. The checkbox is disabled when the server says the target cannot be tagged, and the page then says "Tag assignment is not available for this deployment target." With the checkbox on and no tags in the tenant, it says "No tags are available. Tenant admins can create tags in the Permissions section." |
| **Device ID** | Text field labeled **Device ID (GUID)**. Optional. Leave it blank and the installer reuses the device ID already saved on the machine, or generates a random one. Any value must be a valid GUID and must be unique for each device or install. |

## Values the page fills in automatically

These are not deployment options. You cannot set any of them on this page.

| Value in the script | Where it comes from |
|---------------------|---------------------|
| `-s` server URI | The scheme and host of the browser address you are currently using to reach the server. Generate scripts from the address your agents must connect to, not from an internal hostname. |
| `-t` tenant ID | The tenant claim on your signed-in account. If your account has no tenant, the page reports an error and nothing can be generated. |
| `-i` instance ID | The **Instance ID** section of Tenant Settings (`/tenant-settings`). When **Append instance ID to agent installations** is off, no `-i` is emitted. When it is on, the page uses the **Instance ID** value there, and falls back to this server's hostname when that value is empty. |
| `-ks` and `-ki` | The key secret you generated or supplied, plus the ID of that key. Both are always present once the scripts are visible. |

## Example scripts

The page emits one line per script. They are shown broken across lines here for readability.

### Linux, macOS

```bash
sudo rm -f /tmp/ControlR.Agent.Installer &&
sudo curl -o /tmp/ControlR.Agent.Installer https://controlr.example.com/downloads/linux-x64/ControlR.Agent.Installer &&
sudo chmod +x /tmp/ControlR.Agent.Installer &&
sudo /tmp/ControlR.Agent.Installer install \
  -s https://controlr.example.com \
  -t 123e4567-e89b-12d3-a456-426614174000 \
  -ks <key-secret> \
  -i controlr.example.com \
  -ki 8f14e45f-ea7a-4b4c-9d11-2f6c0a7b3c55
```

### Windows

```powershell
$ProgressPreference = 'SilentlyContinue';
Invoke-WebRequest -Uri "https://controlr.example.com/downloads/win-x64/ControlR.Agent.Installer.exe" -OutFile "$env:TEMP/ControlR.Agent.Installer.exe" -UseBasicParsing;
Start-Process -FilePath "$env:TEMP/ControlR.Agent.Installer.exe" `
  -ArgumentList "install -s https://controlr.example.com -t 123e4567-e89b-12d3-a456-426614174000 -ks <key-secret> -i controlr.example.com -ki 8f14e45f-ea7a-4b4c-9d11-2f6c0a7b3c55" `
  -Verb RunAs;
```

The bootstrap installer then asks your server for the current agent bundle and installs that. The bundle is downloaded over the same server URI, so the installer binary itself is the only file fetched from the paths in the table above.

## Installer flags

The `install` command accepts these options. Both aliases for a row are equivalent.

| Short | Long | Required | Meaning |
|-------|------|----------|---------|
| `-s` | `--server-uri` | Yes | Absolute server URI, including the `https://` scheme. |
| `-t` | `--tenant-id` | Yes | GUID of the tenant the agent is assigned to. |
| `-ks` | `--installer-key-secret` | No | Installer key secret that permits the device to be created on the server. |
| `-ki` | `--installer-key-id` | No | GUID of the installer key to use. |
| `-i` | `--instance-id` | No | Instance ID for this installation, which allows several agent installs on one machine. Normally the server origin. |
| `-d` | `--device-id` | No | Device ID to assign. Omit it to reuse the saved device ID on the system or create a new random one. |
| `-g` | `--device-tags` | No | Comma-separated tag GUIDs to assign to the device. Entries that are not GUIDs are dropped. |
| `-c` | `--customer` | No | Customer GUID to assign the device to at install time. The customer must belong to the same tenant. |

The installer also provides `uninstall` and `repair-desktop`. Both accept only `-i` / `--instance-id`.

## Self-registration

`AllowAgentsToSelfBootstrap` does not change this page. The page never shows scripts without a key secret, and an install run without `-ks` and `-ki` cannot register a new device, because the device-creation endpoint validates the key ID and secret before it creates anything.

The setting affects the agent connection path instead. When it is enabled (`ControlR_AppOptions__AllowAgentsToSelfBootstrap=true`), the server accepts an agent that has no stored public key and lets it create its own device record rather than only updating an existing one. The agent is then placed in the only tenant on the server, and that placement is refused on a server with more than one tenant. Enable it for a single-tenant server where you want agents to register themselves. Leave it off, which is the default, when more than one tenant exists or when registration must go through an installer key.

## Next

- **[Installation](/docs/installation)**: Complete installation guide
- **[Installer Keys](/docs/user-guide/installer-keys)**: Manage installer access keys
