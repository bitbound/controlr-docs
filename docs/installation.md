---
sidebar_position: 2
title: Installation
---

The recommended way to install ControlR is using Docker Compose.

## Prerequisites

- **Docker** and **Docker Compose** installed on your server
- At least 1 GB of RAM available
- An open network port (default: 5120)

## Quick Start

### Using Environment Variables

```bash
wget https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose.yml
# Set environment variables for sensitive values
export ControlR_POSTGRES_USER="controlr_admin"
export ControlR_POSTGRES_PASSWORD="<secure-password>"
export ControlR_ASPIRE_BROWSER_TOKEN="<secure-token>"
docker compose up -d
```

### Using Docker Secrets

For production deployments with sensitive credentials:

```bash
wget -O docker-compose.yml https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose-secrets.yml
# Create secret files and set appropriate permissions (chmod 600)
docker compose up -d
```

## Verify Installation

After the containers start, verify that ControlR is running:

```bash
curl http://127.0.0.1:5120/health
```

You should receive: `"Healthy."`

The ControlR web interface should be available at `http://your-server:5120`.

## Installing the Agent

Once the server is running, install the agent on devices you want to manage:

1. Download the appropriate agent binary for your platform from the server's download page, or from [GitHub Releases](https://github.com/bitbound/ControlR/releases)
2. Run the installer with your server URI and installer key:

```bash
# Windows (run as Administrator)
.\ControlR.Agent.exe install --server-uri https://controlr.example.com

# Linux
sudo ./ControlR.Agent install --server-uri https://controlr.example.com

# macOS
sudo ./ControlR.Agent install --server-uri https://controlr.example.com
```

Installer keys can be generated in the ControlR admin panel under **Settings → Installer Keys**.

## Configuration

ControlR is configured primarily through environment variables in your Docker Compose file. See [Configuration](/docs/configuration) for the full list of options.

Important settings:

- `ControlR_AppOptions__EnablePublicRegistration` — Allow self-registration (default: `false`)
- `ControlR_AppOptions__AllowAgentsToSelfBootstrap` — Allow agents to register without installer keys (default: `false`)
- `ControlR_AppOptions__RequireUserEmailConfirmation` — Require email confirmation for new accounts (default: `true`)

## Important Notes

> **Before v1.0**: There may be breaking changes between minor version increments. Please read the [release notes](https://github.com/bitbound/ControlR/releases) for each version before upgrading and follow any migration steps listed.

## Next Steps

- **[Configuration](/docs/configuration)** — Learn about available settings
- **[Reverse Proxy](/docs/admin/reverse-proxy)** — Set up HTTPS with a reverse proxy
- **[Upgrading](/docs/admin/upgrading)** — How to upgrade when new versions are released
