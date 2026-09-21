---
sidebar_position: 1
title: Native Installation
---

## Overview

ControlR can be deployed natively on Linux without Docker. Each release ships the server as a self-contained ZIP archive that runs on .NET 10. This guide covers the complete setup using systemd.

## Prerequisites

- **Linux, AMD64**: the server archive is `server-linux-amd64.zip`. Ubuntu, Debian, or similar. ARM64 is not a published server target. The last six releases carry no `server-linux-arm64.zip`, and the published container image is `linux/amd64` only. On ARM hardware, build the server yourself. Check the release's asset list before scripting against a name.
- **PostgreSQL 18**: The version ControlR's own Compose file ships. Install via Docker (recommended) or your package manager.
- **Reverse proxy**: Nginx, Caddy, or Apache for HTTPS termination. Recommended.

The release ZIP is a self-contained publish. It bundles the .NET runtime, so you do **not** need to install .NET on the host. It does not bundle the operating-system libraries .NET links against. ControlR does not enable globalization-invariant mode, so the host needs the ICU libraries that provide culture data.

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

# Create a named volume for data persistence
sudo docker volume create controlr-postgres-data

# Create the PostgreSQL container
sudo docker run -d \
  --name controlr-postgres \
  -e POSTGRES_DB=controlr \
  -e POSTGRES_USER=controlr_admin \
  -e POSTGRES_PASSWORD=your-strong-password \
  -p 127.0.0.1:5432:5432 \
  -v controlr-postgres-data:/var/lib/postgresql \
  --restart unless-stopped \
  postgres:18
```

> **Warning: do not change the mount path to `/var/lib/postgresql/data`.** In the `postgres:18` image the data directory moved to `/var/lib/postgresql/18/docker` and the image's declared volume moved to `/var/lib/postgresql`. Mounting the old `data` path leaves that volume unused. Postgres then writes into an automatically created anonymous volume inside the container layer. The container runs normally and the `controlr-postgres-data` volume stays empty. Your data is deleted the first time the container is removed and recreated. ControlR's own `docker-compose.yml` mounts the parent path, and the [official Postgres image documentation](https://hub.docker.com/_/postgres) calls out this change.

The `-p 127.0.0.1:5432:5432` form publishes the port on the loopback interface only. The server connects over `localhost`, so there is no reason to accept database connections from other hosts.

### Option B: Native PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql -c "CREATE USER controlr_admin WITH ENCRYPTED PASSWORD 'your-strong-password';"
sudo -u postgres psql -c "CREATE DATABASE controlr OWNER controlr_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE controlr TO controlr_admin;"
```

The distribution package installs whatever major version that release ships, which is often older than 18. Check with `psql -c "SHOW server_version;"`. Older supported PostgreSQL versions work, but 18 is the version ControlR ships and tests against.

## Step 2: Download and Extract the Server

Releases are published at [github.com/bitbound/ControlR](https://github.com/bitbound/ControlR/releases) with tags in the form `v<version>`. Pick the ZIP matching your CPU architecture.

```bash
# Requires unzip, which minimal server images often omit
sudo apt install -y unzip

# Replace <release-tag> with a specific version, for example v0.10.0
wget https://github.com/bitbound/ControlR/releases/download/<release-tag>/server-linux-amd64.zip
sudo mkdir -p /var/www/dev.controlr.app
sudo unzip server-linux-amd64.zip -d /var/www/dev.controlr.app
cd /var/www/dev.controlr.app
```

The archive is flat. The file layout at the top level includes:

- `ControlR.Web.Server` and `ControlR.Web.Server.dll`. The first is the native launcher, the second is the managed assembly. Use the launcher. See [Step 4](#step-4-create-the-service-user-and-unit).
- `appsettings.json`. The shipped default configuration.
- `wwwroot/` and `novnc/`. Static assets the server serves directly.

## Step 3: Configure the Server

Copy the shipped configuration and override it for production:

```bash
sudo cp appsettings.json appsettings.Production.json
```

The server loads `appsettings.Production.json` only when the environment name is `Production`. Step 4 sets that.

Edit `appsettings.Production.json` and override the values you change. The database keys sit at the JSON root, matching how the server reads them:

```json
{
  "POSTGRES_USER": "controlr_admin",
  "POSTGRES_PASSWORD": "your-strong-password",
  "POSTGRES_HOST": "localhost",
  "POSTGRES_PORT": "5432",
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

Lock the file down, because it now holds the database password:

```bash
sudo chmod 600 appsettings.Production.json
```

Step 4 hands ownership of the directory to the service user, which makes the file readable by the process.

> **Tip:** Everything else is configured the same way. The section names are `AppOptions`, `Bootstrap`, `KeyProtectionOptions`, `AspireDashboard`, and `ServerLifecycle`. See the [Configuration Guide](/docs/configuration) for the full list. You only need to override what you change from the defaults.

To set any of these through the environment instead, use the `ControlR_` prefix. `ControlR_KeyProtectionOptions__EncryptKeys` maps to the `KeyProtectionOptions` section, and `ControlR_POSTGRES_USER` maps to the root-level `POSTGRES_USER` key. The bare section name `KeyProtection` binds nothing.

## Step 4: Create the Service User and Unit

Create the account first, so the unit can reference it:

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin controlr
sudo chown -R controlr:controlr /var/www/dev.controlr.app
```

Then write the unit:

```bash
sudo tee /etc/systemd/system/controlr.service > /dev/null <<'EOF'
[Unit]
Description=ControlR Server
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/var/www/dev.controlr.app
ExecStart=/var/www/dev.controlr.app/ControlR.Web.Server --urls "http://*:5120"
User=controlr
Group=controlr
Restart=always
RestartSec=10
SyslogIdentifier=controlr
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
EOF
```

Three points about this unit:

- `ExecStart` runs the native launcher, not `/usr/bin/dotnet`. A self-contained publish is activated through its launcher. Passing the DLL to a system-installed `dotnet` looks for a shared framework that this layout does not ship.
- `User` and `Group` make the service drop root privileges. Without them the process runs as root, and the service user you created in the step above is never used.
- `WorkingDirectory` sets the content root. The server reads `novnc/` and `wwwroot/` relative to it.

If PostgreSQL runs natively on the same host, add it to the ordering so the server does not start before the database:

```ini
After=network-online.target postgresql.service
Wants=postgresql.service
```

Skip that when Postgres runs in Docker or on another host. systemd cannot order against a unit that does not exist.

## Step 5: Enable and Start the Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable controlr
sudo systemctl start controlr
sudo systemctl status controlr
```

The first start creates the schema. That takes longer than later starts, so `status` may show the unit still activating. Check [Step 8](#step-8-database-migrations) before assuming it hung.

## Step 6: Verify Installation

```bash
curl http://127.0.0.1:5120/health
# Returns: Healthy
```

The server registers the health endpoint through ASP.NET Core health checks. A `Healthy` body means the process started and is answering requests. It does not prove the database connection works, so still run the migration check in Step 8.

## Step 7: Configure a Reverse Proxy (Recommended)

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

### Tell the server to trust the proxy

The server runs in the `Production` environment, which turns on HTTPS redirection and HSTS. It only accepts forwarded headers from addresses in its trust list. A native install has no container gateway address to fall back on, so you must add the proxy yourself. Set one of these in `appsettings.Production.json`:

```json
{
  "AppOptions": {
    "KnownProxies": ["127.0.0.1"]
  }
}
```

Or trust a range:

```json
{
  "AppOptions": {
    "KnownNetworks": ["10.0.0.0/8"]
  }
}
```

`EnableNetworkTrust` replaces both by trusting every source. Only enable it when the server cannot be reached except through the proxy. The [Reverse Proxy guide](/docs/admin/reverse-proxy) covers the remaining options, including Cloudflare and the agent route allowlist.

## Step 8: Database Migrations

ControlR applies EF Core migrations automatically at startup. There is no migration command in the published server. `Program.cs` calls the `ApplyMigrations()` extension method in `Startup/IHostExtensions.cs`, and that method calls `Database.MigrateAsync()`. It runs before the server starts listening, so the first request cannot be served until migrations finish.

### Verify a migration run

Check the EF Core history table. It records every migration the database has applied.

Native PostgreSQL:

```bash
sudo -u postgres psql -d controlr -c \
  'SELECT "MigrationId", "ProductVersion" FROM "__EFMigrationsHistory" ORDER BY "MigrationId";'
```

Docker PostgreSQL:

```bash
sudo docker exec controlr-postgres psql -U controlr_admin -d controlr -c \
  'SELECT "MigrationId", "ProductVersion" FROM "__EFMigrationsHistory" ORDER BY "MigrationId";'
```

Keep the double quotes around `"__EFMigrationsHistory"` and the column names. PostgreSQL lowercases unquoted identifiers and the real names are mixed case.

The newest `MigrationId` should match the last migration in the release you installed. Migration source files are listed in `ControlR.Web.Server/Data/Migrations` in the repository, and the file names start with the same timestamp prefix as `MigrationId`.

### Why the journal does not confirm this

The shipped log configuration sets `"Microsoft": "Warning"`. EF Core logs each applied migration at `Information` under the `Microsoft.EntityFrameworkCore.Migrations` category, which inherits that `Warning` floor. `ApplyMigrations()` adds no logging of its own. The result is a clean journal on a run that applied dozens of migrations, and a clean journal on a run that applied none.

To see the per-migration lines, add a more specific override to `appsettings.Production.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

The most specific matching key wins, so `Microsoft.EntityFrameworkCore.Database` stays at `Warning` and query logs do not flood the journal. Then restart and look for `Applying migration`:

```bash
sudo systemctl restart controlr
sleep 30
sudo journalctl -u controlr -n 200 --no-pager | grep "Applying migration"
```

Expect no output on a server that is already current. That is the correct result, not a failure.

### When migrations fail

`MigrateAsync` throws, the host fails to start, and systemd restarts it every 10 seconds per `RestartSec`. So a server that cannot reach the database during the upgrade window sits in a restart loop and recovers on its own once the database answers. Watch `journalctl -u controlr -n 50 --no-pager` for the underlying exception.

EF Core takes a database-wide lock before applying migrations and holds it for the duration. A second instance starting at the same time waits on that lock instead of racing. Keep the deployment to one instance.

## Step 9: Backups

Set up regular PostgreSQL backups.

### For Docker PostgreSQL

```bash
sudo mkdir -p /var/backups/controlr

# Create backup script
sudo tee /usr/local/bin/controlr-backup > /dev/null <<'EOF'
#!/bin/bash
set -euo pipefail
DATE=$(date +%Y%m%d)
docker exec controlr-postgres pg_dump -U controlr_admin controlr | gzip > /var/backups/controlr/controlr-$DATE.sql.gz
find /var/backups/controlr -name "controlr-*.sql.gz" -mtime +30 -delete
EOF

sudo chmod +x /usr/local/bin/controlr-backup
```

Add to root's crontab (daily at 2 AM):

```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/controlr-backup
```

### For Native PostgreSQL

```bash
sudo mkdir -p /var/backups/controlr

# Create backup script
sudo tee /usr/local/bin/controlr-backup > /dev/null <<'EOF'
#!/bin/bash
set -euo pipefail
DATE=$(date +%Y%m%d)
PGPASSWORD=your-strong-password pg_dump -h localhost -U controlr_admin controlr | gzip > /var/backups/controlr/controlr-$DATE.sql.gz
find /var/backups/controlr -name "controlr-*.sql.gz" -mtime +30 -delete
EOF

sudo chmod +x /usr/local/bin/controlr-backup
```

Add to the `postgres` user's crontab (daily at 2 AM):

```bash
sudo -u postgres crontab -e
# Add: 0 2 * * * /usr/local/bin/controlr-backup
```

Both scripts write a plain `pg_dump` archive. See [Backup & Restore](/docs/admin/backup-restore) for the restore procedure. That page is written for the Docker Compose layout, so substitute the container and user names from this guide.

## Troubleshooting

### Service won't start

```bash
# Check service status
sudo journalctl -u controlr -n 50 --no-pager

# Confirm the launcher exists and is executable
ls -l /var/www/dev.controlr.app/ControlR.Web.Server

# Test the launcher directly (as the service user). Stop it with Ctrl+C.
sudo -u controlr /var/www/dev.controlr.app/ControlR.Web.Server --urls "http://127.0.0.1:5199"
```

Port 5199 keeps the manual run off the service port. Stop the systemd service first if you want to read startup output without interleaving.

A `No such file or directory` error naming `ControlR.Web.Server` when the file clearly exists usually means a missing native dependency, most often ICU.

### Database connection errors

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql          # Native
sudo docker ps | grep controlr-postgres   # Docker

# Test connection (native)
psql -h localhost -U controlr_admin -d controlr

# Test connection (Docker)
sudo docker exec -it controlr-postgres psql -U controlr_admin controlr
```

If the Docker container restarts immediately, check the mount path first. See the warning in Step 1.

### Port conflicts

```bash
# Check what's using port 5120
sudo lsof -i :5120

# Change the port in the service file
# ExecStart=... --urls "http://*:5121"
```

Update `proxy_pass` in the reverse proxy config to match, then run `sudo systemctl daemon-reload` after editing the unit.

### Lost data after recreating the Postgres container

The mount path is almost certainly the cause. Recreate the container with the mount at `/var/lib/postgresql`, then restore from a backup.

## Next

- **[Installation](/docs/installation)**: Docker Compose installation (recommended)
- **[Configuration](/docs/configuration)**: Server configuration options
- **[Reverse Proxy](/docs/admin/reverse-proxy)**: HTTPS configuration
- **[Upgrading](/docs/admin/upgrading)**: How to upgrade when new versions are released
