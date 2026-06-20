---
sidebar_position: 2
title: Installation
---

The recommended way to install ControlR is using Docker Compose.

## Quick Start

### Using Environment Variables

```bash
wget https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose.yml
# Set environment variables for sensitive values or create a .env file
sudo docker compose up -d
```

### Using Docker Secrets

```bash
wget -O docker-compose.yml https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose-secrets.yml
# Create secret files and set appropriate permissions (chmod 600)
sudo docker compose up -d
```

## Verify Installation

After the containers start, verify that ControlR is running:

```bash
curl http://127.0.0.1:5120/health
```

You should receive: `"Healthy."`

The ControlR web interface should be available at `http://your-server:5120`.

## Configuration

You will need to supply sensitive values either via:
- **Environment variables** — Set them directly in the `docker-compose.yml` or a `.env` file
- **Docker Secrets** — Create secret files and reference them in the compose file

See the comments in the docker-compose files for additional configuration options.

## Important Notes

> **Before v1.0**: There may be breaking changes between minor version increments. Please read the [release notes](https://github.com/bitbound/ControlR/releases) for each version before upgrading and follow any migration steps listed.

## Next Steps

- **[Configuration](/docs/configuration)** — Learn about available settings
- **[Reverse Proxy](/docs/admin/reverse-proxy)** — Set up HTTPS with a reverse proxy
- **[Upgrading](/docs/admin/upgrading)** — How to upgrade when new versions are released
