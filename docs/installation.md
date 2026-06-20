---
sidebar_position: 2
title: Installation
---

The recommended way to install ControlR is using Docker Compose.

Prerequisites are listed in the [Getting Started guide](/docs/getting-started).

## Quick Start

### Using Environment Variables

```bash
wget https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose.yml
# Set environment variables for sensitive values or create a .env file
ControlR_POSTGRES_USER="controlr_admin" \
ControlR_POSTGRES_PASSWORD="<secure-password>" \
ControlR_ASPIRE_BROWSER_TOKEN="<secure-token>" \
sudo docker compose up -d
```

### Using Docker Secrets

For production deployments with sensitive credentials:

```bash
wget -O docker-compose.yml https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose-secrets.yml
# Create secret files and set appropriate permissions (chmod 600)
sudo docker compose -f docker-compose-secrets.yml up -d
```

## Verify Installation

After the containers start, verify that ControlR is running:

```bash
curl http://127.0.0.1:5120/health
```

You should receive: `"Healthy."`

The ControlR web interface should be available at `http://your-server:5120` (or `https://your-domain` if you configured a reverse proxy with HTTPS).

## Installing the Agent

Once the server is running, install the agent on devices you want to manage. Agents are available for Windows, macOS, and Linux.

### Download the Installer

Installers are served by the ControlR server itself. After your server is running, the installers are available at:

| Platform | URL |
|----------|-----|
| Windows x64 | `https://your-server/downloads/win-x64/ControlR.Agent.Installer.exe` |
| Windows x86 | `https://your-server/downloads/win-x86/ControlR.Agent.Installer.exe` |
| Linux x64 | `https://your-server/downloads/linux-x64/ControlR.Agent.Installer` |
| macOS ARM64 | `https://your-server/downloads/osx-arm64/ControlR.Agent.Installer` |
| macOS x64 | `https://your-server/downloads/osx-x64/ControlR.Agent.Installer` |

You can also find installers on [GitHub Releases](https://github.com/bitbound/ControlR/releases).

### Install on Linux (via systemd)

```bash
# Download the installer
wget https://your-server/downloads/linux-x64/ControlR.Agent.Installer
chmod +x ControlR.Agent.Installer

# Run the installer (requires root)
sudo ./ControlR.Agent.Installer install \
  --server-uri https://your-server.example.com \
  --tenant-id <your-tenant-guid> \
  [--instance-id my-server] \
  [--device-tags <tag-guid1>,<tag-guid2>] \
  [--installer-key-secret <key-secret>] \
  [--installer-key-id <key-guid>] \
  [--device-id <existing-device-guid>]
```

This will:
1. Extract the agent bundle to `/usr/local/bin/controlr`
2. Generate systemd service files for both the agent and desktop client
3. Enable and start the agent service automatically
4. Create the device registration on the server (if an installer key is provided)

To uninstall:
```bash
sudo ./ControlR.Agent.Installer uninstall [--instance-id my-server]
```

### Install on macOS

```bash
# Download the installer
wget https://your-server/downloads/osx-arm64/ControlR.Agent.Installer
chmod +x ControlR.Agent.Installer

# Run the installer (requires root)
sudo ./ControlR.Agent.Installer install \
  --server-uri https://your-server.example.com \
  --tenant-id <your-tenant-guid> \
  [--instance-id my-mac] \
  [--device-tags <tag-guid1>,<tag-guid2>] \
  [--installer-key-secret <key-secret>] \
  [--installer-key-id <key-guid>] \
  [--device-id <existing-device-guid>]
```

This will:
1. Install the app bundle to `/Applications/ControlR.app`
2. Install launchd daemons for the agent, desktop client, and self-updater
3. Start the agent service automatically
4. Create the device registration on the server

To uninstall:
```bash
sudo ./ControlR.Agent.Installer uninstall [--instance-id my-mac]
```

### Install on Windows

```powershell
# Download the installer (run as Administrator)
Invoke-WebRequest -Uri "https://your-server/downloads/win-x64/ControlR.Agent.Installer.exe" -OutFile "ControlR.Agent.Installer.exe"

# Run the installer
.\ControlR.Agent.Installer.exe install `
  -ServerUri "https://your-server.example.com" `
  -TenantId "<your-tenant-guid>" `
  [-InstanceId "my-pc"] `
  [-DeviceTags "tag-guid1","tag-guid2"] `
  [-InstallerKeySecret "<key-secret>"] `
  [-InstallerKeyId "<key-guid>"] `
  [-DeviceId "<existing-device-guid>"]
```

This will:
1. Install to `C:\Program Files\ControlR\<instanceId>`
2. Create a Windows Service for the agent
3. Start the agent service automatically
4. Create the device registration on the server

To uninstall:
```powershell
.\ControlR.Agent.Installer.exe uninstall [-InstanceId "my-pc"]
```

### Installer Arguments Reference

| Argument | Required | Description |
|----------|----------|-------------|
| `--server-uri` | Yes | URL of the ControlR server (e.g., `https://controlr.example.com`) |
| `--tenant-id` | Yes | GUID of the tenant this agent belongs to |
| `--instance-id` | No | Multi-instance identifier. Useful when running multiple agents on the same machine |
| `--device-tags` | No | Comma-separated list of tag GUIDs to assign to the device |
| `--installer-key-secret` | No | Secret of an installer access key for device registration |
| `--installer-key-id` | No | GUID of a specific installer key to use |
| `--device-id` | No | GUID of an existing device to associate with this installation |

### Self-Registration (No Installer Key)

If `AllowAgentsToSelfBootstrap` is `true` in your server configuration, you can install the agent without an installer key. The device will self-register with the server:

```bash
sudo ./ControlR.Agent.Installer install \
  --server-uri https://your-server.example.com \
  --tenant-id <your-tenant-guid>
```

## Configuration

ControlR is configured primarily through environment variables in your Docker Compose file. See [Configuration](/docs/configuration) for the full list of options.

Key settings:

- `ControlR_AppOptions__EnablePublicRegistration` — Allow self-registration (default: `false`)
- `ControlR_AppOptions__AllowAgentsToSelfBootstrap` — Allow agents to register without installer keys (default: `false`)
- `ControlR_AppOptions__RequireUserEmailConfirmation` — Require email confirmation for new accounts (default: `false`)

## Next Steps

- **[Configuration](/docs/configuration)** — Learn about available settings
- **[Reverse Proxy](/docs/admin/reverse-proxy)** — Set up HTTPS with a reverse proxy
- **[Upgrading](/docs/admin/upgrading)** — How to upgrade when new versions are released
