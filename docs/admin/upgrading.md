---
sidebar_position: 2
title: Upgrading
---

## Before Upgrading

> **Important**: Until ControlR reaches v1.0, breaking changes between minor version increments are possible.

## Pre-Upgrade Checklist

1. Snapshot the server and database (see [Backup & Restore](/docs/admin/backup-restore)).
2. Read the [release notes](https://github.com/bitbound/ControlR/releases) for all versions in between your current version and the target version before upgrading.
3. If any manual steps are required, follow the instructions for migrating.
4. Schedule a brief maintenance window, especially for the agent self-update.
5. Check the latest [docker-compose.yml](https://github.com/bitbound/ControlR/blob/main/docker-compose/docker-compose.yml) for any new configuration values that might need to be added to your setup, as new settings are added over time.

## Upgrade Steps

1. **Pin the target tag in your `docker-compose.yml`.** Set `image: bitbound/controlr:<release-tag>` for the `controlr` service (replace `<release-tag>` with the version you want, e.g. `v0.10.0`). `latest` is convenient for hobby deployments but it skips the upgrade step entirely and removes your ability to roll back to a known tag.
2. **Pull the image:**
   ```bash
   sudo docker compose pull
   ```
3. **Recreate the container:**
   ```bash
   sudo docker compose up -d
   ```
   Compose restarts only the services whose image changed. Migrations run automatically on the server's first startup at the new version.

## Verifying the Upgrade

Open the ControlR web UI in your browser and sign in to confirm:

- The login page loads (the app accepts connections).
- You can sign in with server administrator permissions.
- The agent list shows the new agent version pulling down from the server.
- The Aspire dashboard (if enabled; see [Telemetry](/docs/admin/telemetry)) shows no errors during the migration window.

If you automate checks, the server exposes `GET /health` which returns `Healthy` once startup completes:

```bash
curl http://127.0.0.1:5120/health
```

## Rollback

EF Core migrations applied during the upgrade are forward-only. Rolling back the server image without restoring the database may leave the schema in a state the older server does not understand.

The cleanest rollback sequence:

1. Restore the pre-upgrade database backup (see [Backup & Restore](/docs/admin/backup-restore)).
2. Edit `docker-compose.yml` and pin the image to the previous tag (`bitbound/controlr:<previous-tag>`).
3. Apply:
   ```bash
   sudo docker compose pull
   sudo docker compose up -d
   ```
