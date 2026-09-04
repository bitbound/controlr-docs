---
sidebar_position: 6
title: Deploy
---

## Overview

The Deploy page generates install scripts for deploying the ControlR agent to remote machines. It supports Windows, macOS, and Linux.

## Accessing Deploy

1. Navigate to the Deploy page (`/deploy`)
2. You need the `agent.install` permission to access this page

## Generating Install Scripts

Select your target platform and configure the deployment options:

### Platform Selection

| Platform | Architecture | Script Type |
|----------|-------------|-------------|
| **Windows** | x64, x86 | PowerShell, Command Prompt |
| **macOS** | ARM64, x64 | Bash, Zsh |
| **Linux** | x64 | Bash, Zsh |

### Deployment Options

| Option | Description |
|--------|-------------|
| **Server URI** | URL of the ControlR server (e.g., `https://controlr.example.com`) |
| **Tenant ID** | GUID of the tenant this agent belongs to |
| **Instance ID** | Optional multi-instance identifier |
| **Device Tags** | Comma-separated tag GUIDs to assign to the device |
| **Installer Key** | Secret of an installer access key for device registration |
| **Device ID** | GUID of an existing device (skip registration) |

### Copy-to-Clipboard

After configuring the options, click the **Copy Script** button to copy a ready-to-run installation command to your clipboard.

#### Example: Linux

```bash
wget https://your-server/downloads/linux-x64/ControlR.Agent.Installer
chmod +x ControlR.Agent.Installer
sudo ./ControlR.Agent.Installer install \
  --server-uri https://controlr.example.com \
  --tenant-id 123e4567-e89b-12d3-a456-426614174000 \
  --instance-id web-server-01 \
  --device-tags tag-guid-1,tag-guid-2
```

#### Example: Windows PowerShell

```powershell
Invoke-WebRequest -Uri "https://your-server/downloads/win-x64/ControlR.Agent.Installer.exe" -OutFile "installer.exe"
.\installer.exe install `
  --server-uri "https://your-server.example.com" `
  --tenant-id "123e4567-e89b-12d3-a456-426614174000" `
  --instance-id "workstation-01"
```

## Self-Registration

If `AllowAgentsToSelfBootstrap` is enabled in your server configuration, you can deploy agents without providing an installer key:

```bash
sudo ./ControlR.Agent.Installer install \
  --server-uri https://controlr.example.com \
  --tenant-id 123e4567-e89b-12d3-a456-426614174000
```

## Next

- **[Installation](/docs/installation)**: Complete installation guide
- **[Installer Keys](/docs/user-guide/installer-keys)**: Manage installer access keys
