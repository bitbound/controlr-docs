---
sidebar_position: 2
title: Upgrading
---

## Before Upgrading

> **Important**: Until ControlR reaches v1.0, there may be breaking changes between minor version increments. Please read the [release notes](https://github.com/bitbound/ControlR/releases) for each version before upgrading.

## Upgrade Steps

1. **Read the release notes** — Check for any migration steps
2. **Backup your database** — See [Backup & Restore](/docs/admin/backup-restore)
3. **Pull the new image**:
   ```bash
   sudo docker compose pull
   ```
4. **Restart the containers**:
   ```bash
   sudo docker compose up -d
   ```
5. **Verify** — Check the health endpoint:
   ```bash
   curl http://127.0.0.1:5120/health
   ```

You should receive: `"Healthy."`

## Rollback

If the new version causes issues:

```bash
# Revert to the previous version
sudo docker compose stop
sudo docker compose pull <previous-version-tag>
sudo docker compose up -d
```
