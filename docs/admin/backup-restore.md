---
sidebar_position: 4
title: Backup & Restore
---

## What the database holds

ControlR uses PostgreSQL. The Docker Compose setup pins `postgres:18`.

The database holds user accounts and Identity data, tenants, devices and their device public keys, permission assignments, installer keys and their usage, personal-access-token and service-account credentials, server alerts, user storage items, the ASP.NET Core Data Protection key ring, and the EF Core migration history. A logical dump of this database is the whole server-side state.

Three things are **not** in the database, so no database backup covers them.

- Your environment or `.env` secrets. These include `ControlR_POSTGRES_USER`, `ControlR_POSTGRES_PASSWORD`, the Aspire browser token, SMTP credentials, external login client secrets, and any bootstrap admin secrets. Losing them means you cannot start the stack and you must re-provision the external credentials.
- The key-protection certificate, if you enabled it. See the next section.
- Agent-side state and app binaries. Each agent keeps its own Ed25519 private key, device id, and `appsettings.json` on the managed machine. The server stores only each device's public key. The agent installer and update bundles are served from the server's web root inside the container image. None of that is database data.

### Key-protection certificate

Data Protection keys live in the `DataProtectionKeys` table and are included in a dump. If you set `ControlR_KeyProtectionOptions__EncryptKeys: true`, those rows are encrypted with the X.509 certificate named by `ControlR_KeyProtectionOptions__CertificatePath` or `ControlR_KeyProtectionOptions__CertificateContentsBase64`, plus its password. A restored database is then unusable without that same certificate. Back up the certificate and password next to the database, or keep `EncryptKeys` off.

## Database Backup

### Backup with pg_dump

`pg_dump` takes a transactionally consistent snapshot, so you do not need to stop ControlR first. Stopping the app only avoids new writes landing during the dump.

The Postgres superuser is whatever you set in `ControlR_POSTGRES_USER`. There is no default for it. Use that same user in the commands below. The example reads it from your `.env` first.

```bash
# Load the Compose variables so the username is available to the shell
set -a; . ./.env; set +a

# Dump the database. controlr is the database name from POSTGRES_DB
sudo docker compose exec -T postgres \
  pg_dump -U "$ControlR_POSTGRES_USER" -d controlr \
  > "controlr-backup-$(date +%Y%m%d).sql"
```

### Backup via Docker Volume Copy

The Compose file creates a named volume `controlr-data` mounted at `/var/lib/postgresql`. A raw file copy is the fragile method. It is valid only for the same major version of Postgres and only while the server is fully stopped. Postgres 18 keeps its data in `/var/lib/postgresql/18/docker`, and copying the whole volume captures it. Prefer `pg_dump`.

```bash
# Stop the database cleanly first
sudo docker compose stop postgres

sudo docker run --rm \
  -v controlr-data:/data \
  -v "$PWD":/backup \
  alpine tar czf /backup/controlr-backup-$(date +%Y%m%d).tar.gz -C /data .

sudo docker compose start postgres
```

### Automated Backups

Schedule a `pg_dump`. In cron, the percent signs in `date` need escaping and the username must be available to the command.

```cron
0 2 * * * cd /opt/controlr && set -a && . ./.env && set +a && \
  docker compose exec -T postgres \
  pg_dump -U "$ControlR_POSTGRES_USER" -d controlr \
  > /backups/controlr-$(date +\%Y\%m\%d).sql
```

## Restoring from Backup

### Restore from a pg_dump SQL File

A plain `pg_dump` contains `CREATE` statements but no `DROP` statements. Restoring it into the existing `controlr` database fails on the first object that already exists. Empty the database first, or back it up with `pg_dump --clean --if-exists` so the dump drops objects before recreating them.

```bash
set -a; . ./.env; set +a

# Stop the app so it is not writing during the restore
sudo docker compose stop controlr

# Drop and recreate an empty controlr database
sudo docker compose exec -T postgres \
  psql -U "$ControlR_POSTGRES_USER" -d postgres -c 'DROP DATABASE IF EXISTS controlr;'
sudo docker compose exec -T postgres \
  psql -U "$ControlR_POSTGRES_USER" -d postgres -c 'CREATE DATABASE controlr;'

# Restore
sudo docker compose exec -T postgres \
  psql -U "$ControlR_POSTGRES_USER" -d controlr \
  < controlr-backup.sql

sudo docker compose start controlr
```

On startup the server runs pending EF Core migrations automatically. If the dump came from an older server version, those migrations apply on the next start. Do not restore a dump taken from a newer version into an older server image. The older code cannot read the newer schema, and EF Core will not roll it back. Run the same image the backup was taken from, or a newer one.

### Restore from Volume Backup

```bash
sudo docker compose stop postgres

sudo docker run --rm \
  -v controlr-data:/data \
  -v "$PWD":/backup \
  alpine tar xzf /backup/controlr-backup.tar.gz -C /data

sudo docker compose start postgres
sudo docker compose start controlr
```

A volume restore must go back to a matching `postgres:18` image and the same `ControlR_POSTGRES_USER` and `ControlR_POSTGRES_PASSWORD`, or the server will not accept the data directory.

## What a Restore Cannot Recover

- Anything that changed after the backup. Devices registered, users invited, and alerts set since the dump are gone.
- Live state. Connected agents, SignalR sessions, and in-progress remote-control sessions do not survive. They reconnect on their own.
- Your `.env` secrets and, if enabled, the key-protection certificate. Restore the database but lose the certificate, and the encrypted Data Protection keys cannot be decrypted. Existing sign-in cookies and any Data-Protection-protected values become unreadable, and users must sign in again.
- Agent-side files. Agents are not part of a server restore. Restoring an old database can leave a device public key out of sync with an agent that re-paired since, which surfaces as that agent failing to authenticate.

## Next

- **[Docker Setup](/docs/admin/docker-setup)**: Container configuration
- **[Reverse Proxy](/docs/admin/reverse-proxy)**: HTTPS configuration
