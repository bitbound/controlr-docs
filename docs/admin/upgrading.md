---
sidebar_position: 3
title: Upgrading
---

## What An Upgrade Touches

An upgrade replaces the server image or the server files. The server migrates the database schema itself during startup. Every agent then upgrades itself by downloading the new bundle from that server. No other component has a manual migration step.

ControlR is pre-1.0. Behavior changes between version increments, and each release notes page opens with a **Breaking Changes** section. Read it for every version between your current one and the target.

### Version tags

The image tag and the GitHub release tag are different strings.

| Artifact | Example | Rule |
| --- | --- | --- |
| Docker image | `bitbound/controlr:0.28.15.0` | Version, no `v` |
| GitHub release | `v0.28.15.0` | Version with a leading `v` |

The image tag is a plain numeric version, while a GitHub release tag carries a leading `v`. Copying a release tag straight into the `image:` key produces `manifest unknown`.

Docker Hub also carries the channel tags `latest`, `preview`, and `dev`. Pin a version anyway. A pre-release build publishes only to `dev`, so `latest` never moves onto a build whose GitHub release is marked pre-release.

### The database

The server applies every pending database migration at startup, before it accepts a single request. There is no migration command in the published image or in the release ZIP.

Two consequences follow from that ordering. The `/health` endpoint stays unreachable while migrations run, so a long first request is normal. A server that cannot reach PostgreSQL during the upgrade window never gets past migrations, and the `restart: unless-stopped` policy keeps retrying it until the database answers.

Migrations add columns and backfill them, so existing records survive. What they do not preserve is the old shape. The 0.28 permission restructure copies each user's legacy role memberships into permission assignments and only then removes the Identity role tables. Access is carried forward. Those tables are gone, which is what makes [Rollback](#rollback) a database restore rather than an image swap.

### The agents

Every agent compares its installed bundle against the bundle the server publishes, on start, on every hub reconnect, and on a six hour timer. When the two SHA-256 hashes differ, the agent downloads the installer the server is currently offering and runs it, which replaces the installed bundle and restarts the agent process. A server upgrade therefore fans out to your whole fleet without anyone clicking anything. There is no server-side setting that holds agents on the old version. The only brake is the per-agent developer option `DisableAutoUpdate`, which has to be set on each agent before the upgrade.

Each server start also marks every device and every user offline in the database. Devices reappear as agents reconnect. Expect remote control and terminal sessions to drop, both at the server restart and at each agent's own reinstall.

## Pre-Upgrade Checklist

1. Back up the database with `pg_dump`. See [Backup & Restore](/docs/admin/backup-restore). A rollback needs it, and it is the only way back.
2. Read the release notes for every version in between, current through target. Start at the [releases page](https://github.com/bitbound/ControlR/releases).
3. Download the `docker-compose.yml` asset attached to the release you are moving to. Diff its `environment` block against the file you run and add any new keys. Do not diff against `main`, because `main` carries settings that your target release does not have.
4. Check the `postgres:` image tag in that file against the major version your `controlr-data` volume holds. Postgres stores the initializing version in the data directory, and a new major release refuses to open a cluster it did not create. A major bump is a separate migration using `pg_dump` and reload, or `pg_upgrade`.
5. Size the maintenance window around the agent count, not around the server. The server restart is the short part.

## Upgrade Steps, Docker Compose

Run these from the directory that holds your Compose file and your `.env`. The bundled file declares `ControlR_POSTGRES_USER`, `ControlR_POSTGRES_PASSWORD`, and `ControlR_ASPIRE_BROWSER_TOKEN` as mandatory, so compose commands abort when the environment is missing.

1. **Pin the target version.** In the `controlr` service, set the image to the version, without a `v`:

   ```yaml
   services:
     controlr:
       image: bitbound/controlr:0.28.15.0
   ```

2. **Confirm which image Compose will actually use.** A `docker-compose.override.yml` sitting next to the file replaces the image.

   ```bash
   sudo docker compose config | grep image
   ```

   Expect `bitbound/controlr:0.28.15.0` for the `controlr` service.

3. **Merge any new configuration keys** from the release's Compose file into the `controlr` service. Keep your own database credentials and any values you deliberately changed.

4. **Pull.**

   ```bash
   sudo docker compose pull
   ```

   This pulls all three services in the file, including `postgres:18` and the Aspire dashboard. Minor Postgres updates are applied by that pull. Minor releases need no dump and reload, so that is safe.

5. **Recreate the containers.**

   ```bash
   sudo docker compose up -d
   ```

   Compose stops and recreates a service only when its image or configuration changed, and it preserves mounted volumes. Migrations run on the ControlR container's first start at the new version.

Do not run `docker compose down -v` as part of an upgrade. That flag removes named volumes, and `controlr-data` is the database.

## Upgrade Steps, Native systemd Install

The native path is the same shape with more steps you perform by hand. [Native Installation](/docs/admin/native-installation) describes the layout these steps assume.

1. Stop the service.

   ```bash
   sudo systemctl stop controlr
   ```

2. Download the `server-*.zip` asset for your runtime from the release. The runtime set differs between releases, so pick from what that release actually attaches.
3. Extract into a clean directory. The archive is flat, and unzipping straight over an old install leaves files from the previous version in place beside the new ones.
4. Copy your `appsettings.Production.json` into the new directory. The archive ships its own `appsettings.json` defaults, so re-check that file for keys you need to carry over, and keep the mode at `600`.
5. Point the unit at the new directory if the path changed, then hand ownership to the service user.

   ```bash
   sudo chown -R controlr:controlr /var/www/dev.controlr.app
   sudo systemctl daemon-reload
   sudo systemctl start controlr
   ```

Migrations apply on that start, the same way they do in Docker.

## Verifying The Upgrade

```bash
curl http://127.0.0.1:5120/health
# Healthy
```

`Healthy` means the process got past migrations and is answering requests, because migrations complete before the app starts listening. It does not mean the database is fine. The only registered check is the built-in self check, so this endpoint reports `Healthy` while PostgreSQL is unreachable.

Confirm which build is serving:

```bash
curl -s http://127.0.0.1:5120/downloads/Version.txt
```

That file ships inside the image, so the value is the version the server hands to agents as the update target.

To confirm the migrations ran, read the EF Core history table. [Native Installation](/docs/admin/native-installation#step-8-database-migrations) gives the query for both the Docker and the native database. Record the newest `MigrationId` before the upgrade, then read it again after. A value that moved forward means the schema caught up with the release.

Then sign in to the web UI and check that the login page loads and that an account with server administrator permissions can sign in.

Agents need longer. Sign-in works while the fleet is still on the old version, and the device list shows the version each agent last reported. Give an agent a reconnect or a six hour tick before reading its row. To move one device now, use the **Update** action in that device's Actions menu on the dashboard.

If the Aspire dashboard is enabled, watch it across the migration window. See [Telemetry](/docs/admin/telemetry).

## Rollback

There is no supported downgrade path. Migrations only move a database forward, and neither the image nor the release ZIP ships a tool that moves it back. Some migrations delete rows on the way up and cannot put them back.

Swapping only the image tag is not a rollback. The database schema stays ahead of the code, and a pre-0.28 server expects the Identity role tables that the permission restructure removed. That fails at startup or on the first authorization query rather than degrading quietly.

The rollback sequence is a restore:

1. Restore the pre-upgrade dump. See [Backup & Restore](/docs/admin/backup-restore) for the empty-the-database-first step a plain dump requires.
2. Pin the `controlr` service to the previous version, without the `v`.
3. Apply it.

   ```bash
   sudo docker compose pull
   sudo docker compose up -d
   ```

Anything written between the dump and the rollback is gone with the restore. That includes devices registered in that window, permission assignments, and alert history. Say so to whoever approved the window before you start, not after.

The agents follow the server. The update check compares hashes, not versions, so an agent that already moved ahead sees a mismatch and reinstalls the older bundle the restored server publishes. If you want the fleet left on the newer build while you sort out the server, set `DisableAutoUpdate` on those agents before you restore. A manual **Update** action on a device bypasses that flag.
