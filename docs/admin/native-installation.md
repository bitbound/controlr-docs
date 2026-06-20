---
sidebar_position: 0
title: Native Installation
---

## Overview

ControlR can be deployed natively on Linux without Docker. The server is published as a ZIP archive with each release and runs on .NET 10. This guide covers the complete setup using systemd.

## Prerequisites

- **Linux** — AMD64 (Ubuntu, Debian, or similar)
- **.NET 10 Runtime** — Install from [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/10.0)
- **PostgreSQL 18** — Install from your package manager or PostgreSQL repository
- **Reverse Proxy** — Nginx or Caddy for HTTPS termination (optional but recommended)

## Step 1: Install PostgreSQL

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
mkdir -p /opt/controlr
unzip server-linux-amd64.zip -d /opt/controlr
cd /opt/controlr
```

## Step 3: Create the Systemd Service

```bash
sudo tee /etc/systemd/system/controlr.service > /dev/null <<EOF
[Unit]
Description=ControlR Web Server
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=controlr
Group=controlr
WorkingDirectory=/opt/controlr
ExecStart=/usr/bin/dotnet ControlR.Web.Server.dll
Restart=always
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_HTTP_PORTS=5120

# PostgreSQL connection (or use a config file)
Environment=ControlR_POSTGRES_HOST=localhost
Environment=ControlR_POSTGRES_PORT=5432
Environment=ControlR_POSTGRES_USER=controlr_admin
Environment=ControlR_POSTGRES_PASSWORD=your-strong-password
Environment=ControlR_POSTGRES_DB=controlr

# Admin bootstrap (optional, only on first startup)
# Environment=ControlR_Bootstrap__AdminEmail=admin@example.com
# Environment=ControlR_Bootstrap__AdminPassword=SecureP@ssw0rd

# Aspire Dashboard (optional)
Environment=ControlR_AspireDashboard__PublicWebUrl=http://localhost:18888

# Logging
Environment=ControlR_Logging__LogLevel__Default=Information
Environment=ControlR_Logging__LogLevel__Microsoft.AspNetCore=Warning

LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```

### Create a dedicated user for running the service

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin controlr
sudo chown -R controlr:controlr /opt/controlr
```

## Step 4: Enable and Start the Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable controlr
sudo systemctl start controlr
sudo systemctl status controlr
```

## Step 5: Verify Installation

```bash
curl http://127.0.0.1:5120/health
# Should return: "Healthy."
```

## Step 6: Configure a Reverse Proxy (Recommended)

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name controlr.example.com;

    ssl_certificate /etc/letsencrypt/live/controlr.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/controlr.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5120;
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
    reverse_proxy localhost:5120
}
```

## Step 7: Configure the Server

Server configuration is done through environment variables in the systemd service file or via a configuration file. See the [Configuration Guide](/docs/configuration) for the full list of options.

Common configuration additions to the service file:

```bash
# SMTP settings (for email confirmation)
Environment=ControlR_AppOptions__SmtpHost=smtp.gmail.com
Environment=ControlR_AppOptions__SmtpPort=587
Environment=ControlR_AppOptions__SmtpEmail=noreply@example.com
Environment=ControlR_AppOptions__SmtpDisplayName=ControlR
Environment=ControlR_AppOptions__SmtpUserName=noreply@example.com
Environment=ControlR_AppOptions__SmtpPassword=smtp-password

# Enable public registration (optional)
# Environment=ControlR_AppOptions__EnablePublicRegistration=true

# CORS (optional)
# Environment=ControlR_AppOptions__EnableCors=true
# Environment=ControlR_AppOptions__CorsAllowedOrigins__0=https://app.example.com
```

After changing the service file:
```bash
sudo systemctl daemon-reload
sudo systemctl restart controlr
```

## Step 8: Set Up Database Migrations

ControlR uses EF Core migrations. Run migrations on first deployment:

```bash
cd /opt/controlr
sudo -u controlr dotnet ControlR.Web.Server.dll db-migrate
```

## Step 9: Backups

Set up regular PostgreSQL backups:

```bash
# Create backup script
sudo tee /usr/local/bin/controlr-backup > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
PGPASSWORD=your-strong-password pg_dump -h localhost -U controlr_admin controlr | gzip > /var/backups/controlr-$DATE.sql.gz
# Keep only last 30 days
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
sudo -u controlr dotnet /opt/controlr/ControlR.Web.Server.dll
```

### Database connection errors

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U controlr_admin -d controlr
```

### Port conflicts

```bash
# Check what's using port 5120
sudo lsof -i :5120

# Change the port in the service file
# Environment=ASPNETCORE_HTTP_PORTS=5121
```

## Next

- **[Installation](/docs/installation)** — Docker Compose installation (recommended)
- **[Configuration](/docs/configuration)** — Server configuration options
- **[Reverse Proxy](/docs/admin/reverse-proxy)** — HTTPS configuration
