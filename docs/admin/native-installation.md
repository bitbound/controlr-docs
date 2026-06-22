---
sidebar_position: 0
title: Native Installation
---

## Overview

ControlR can be deployed natively on Linux without Docker. The server is published as a ZIP archive with each release and runs on .NET 10. This guide covers the complete setup using systemd.

## Prerequisites

- **Linux** — AMD64 (Ubuntu, Debian, or similar)
- **.NET 10 Runtime** — Install from [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/10.0)
- **PostgreSQL 18** — Install via Docker (recommended) or your package manager
- **Reverse Proxy** — Nginx or Caddy for HTTPS termination (optional but recommended)

## Step 1: Install PostgreSQL

### Option A: Docker (Recommended)

```bash
# Install Docker if not already installed
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Create the PostgreSQL container
sudo docker run -d \
  --name controlr-postgres \
  -e POSTGRES_DB=controlr \
  -e POSTGRES_USER=controlr_admin \
  -e POSTGRES_PASSWORD=your-strong-password \
  -p 5432:5432 \
  -v controlr-postgres-data:/var/lib/postgresql/data \
  postgres:18

# Create a named volume for data persistence
sudo docker volume create controlr-postgres-data
```

### Option B: Native PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql -c "CREATE USER controlr_admin WITH ENCRYPTED PASSWORD 'your-strong-password';"
sudo -u postgres psql -c "CREATE DATABASE controlr OWNER controlr_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE controlr TO controlr_admin;"
```

## Step 2: Download and Extract the Server

```bash
# Download from GitHub Releases
wget https://github.com/bitbound/ControlR/releases/download/v1.0.0/server-linux-amd64.zip
mkdir -p /var/www/dev.controlr.app
unzip server-linux-amd64.zip -d /var/www/dev.controlr.app
cd /var/www/dev.controlr.app
```

## Step 3: Configure the Server

Copy the configuration file and update it for production:

```bash
cp appsettings.json appsettings.Production.json
```

Edit `appsettings.Production.json` with your production settings:

```json
{
  "POSTGRES_USER": "controlr_admin",
  "POSTGRES_PASSWORD": "your-strong-password",
  "POSTGRES_HOST": "localhost",
  "POSTGRES_PORT": 5432,
  "POSTGRES_DB": "controlr",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.AspNetCore.HttpLogging": "Information",
      "Microsoft.AspNetCore.HttpOverrides": "Debug",
      "Microsoft.EntityFrameworkCore.Database": "Warning",
      "System.Net.Http.HttpClient": "Warning",
      "Polly": "Warning"
    }
  }
}
```

> **Tip:** Other configuration options (SMTP, Bootstrap, KeyProtection, AppOptions, etc.) are configured the same way. See the [Configuration Guide](/docs/configuration) for the full list. You only need to override what you change from the defaults.

## Step 4: Create the Systemd Service

```bash
sudo tee /etc/systemd/system/controlr.service > /dev/null <<EOF
[Unit]
Description=ControlR Server
After=network.target postgresql.service
Wants=postgresql.service

[Service]
WorkingDirectory=/var/www/dev.controlr.app
ExecStart=/usr/bin/dotnet /var/www/dev.controlr.app/ControlR.Web.Server.dll --urls "http://*:5002"
Restart=always
RestartSec=10
SyslogIdentifier=dev.controlr.app
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
EOF
```

### Create a dedicated user for running the service

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin controlr
sudo chown -R controlr:controlr /var/www/dev.controlr.app
```

## Step 5: Enable and Start the Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable controlr
sudo systemctl start controlr
sudo systemctl status controlr
```

## Step 6: Verify Installation

```bash
curl http://127.0.0.1:5002/health
# Should return: "Healthy."
```

## Step 7: Configure a Reverse Proxy (Recommended)

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name controlr.example.com;

    ssl_certificate /etc/letsencrypt/live/controlr.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/controlr.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy

```caddy
controlr.example.com {
    reverse_proxy localhost:5002
}
```

## Step 8: Apply Database Migrations

ControlR applies EF Core migrations automatically at startup. When you start the service for the first time, migrations run before the app becomes available:

```bash
sudo systemctl start controlr
```

Verify migrations applied successfully:

```bash
sudo journalctl -u controlr -n 50 --no-pager
# Look for "Applying migrations..." and "Migrations applied successfully" in the output
```

If you need to manually run migrations (e.g., for debugging), install the EF Core CLI tools:

```bash
dotnet tool install --global dotnet-ef
cd /var/www/dev.controlr.app
sudo -u controlr dotnet ef database update
```

## Step 9: Backups

Set up regular PostgreSQL backups:

### For Docker PostgreSQL

```bash
# Create backup script
sudo tee /usr/local/bin/controlr-backup > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
sudo docker exec controlr-postgres pg_dump -U controlr_admin controlr | gzip > /var/backups/controlr-$DATE.sql.gz
find /var/backups -name "controlr-*.sql.gz" -mtime +30 -delete
EOF

sudo chmod +x /usr/local/bin/controlr-backup

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/controlr-backup
```

### For Native PostgreSQL

```bash
# Create backup script
sudo tee /usr/local/bin/controlr-backup > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
PGPASSWORD=your-strong-password pg_dump -h localhost -U controlr_admin controlr | gzip > /var/backups/controlr-$DATE.sql.gz
find /var/backups -name "controlr-*.sql.gz" -mtime +30 -delete
EOF

sudo chmod +x /usr/local/bin/controlr-backup

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/controlr-backup
```

## Troubleshooting

### Service won't start

```bash
# Check service status
sudo journalctl -u controlr -n 50 --no-pager

# Check .NET runtime is installed
dotnet --info

# Test the DLL directly (as the service user)
sudo -u controlr dotnet /var/www/dev.controlr.app/ControlR.Web.Server.dll
```

### Database connection errors

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql   # Native
sudo docker ps | grep controlr-postgres   # Docker

# Test connection (native)
psql -h localhost -U controlr_admin -d controlr

# Test connection (Docker)
sudo docker exec -it controlr-postgres psql -U controlr_admin controlr
```

### Port conflicts

```bash
# Check what's using port 5002
sudo lsof -i :5002

# Change the port in the service file
# ExecStart=... --urls "http://*:5003"
```

## Next

- **[Installation](/docs/installation)** — Docker Compose installation (recommended)
- **[Configuration](/docs/configuration)** — Server configuration options
- **[Reverse Proxy](/docs/admin/reverse-proxy)** — HTTPS configuration
