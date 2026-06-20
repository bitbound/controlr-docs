---
sidebar_position: 3
title: Backup & Restore
---

## Database Backup

ControlR uses PostgreSQL as its database, storing device information, user accounts, tenant settings, and session data. Regular backups are essential.

### Backup with pg_dump (Recommended)

The recommended approach is to use `pg_dump` against the PostgreSQL container:

```bash
# Stop the ControlR app (to ensure consistent state)
sudo docker compose stop controlr

# Run pg_dump against the PostgreSQL container
sudo docker compose exec postgres pg_dump -U controlr_admin controlr > controlr-backup-$(date +%Y%m%d).sql

# Start ControlR again
sudo docker compose start controlr
```

### Backup via Docker Volume Copy

Alternatively, backup the PostgreSQL data volume directly:

```bash
# Stop services
sudo docker compose stop

# Backup the volume
sudo docker run --rm \
  -v controlr-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/controlr-backup-$(date +%Y%m%d).tar.gz -C /data .

# Start services again
sudo docker compose start
```

### Automated Backups

Set up a cron job for regular backups:

```bash
# Example: daily backup at 2 AM
0 2 * * * sudo docker compose exec postgres pg_dump -U controlr_admin controlr > /backups/controlr-$(date +\%Y\%m\%d).sql
```

## Restoring from Backup

### Restore from pg_dump SQL File

```bash
# Stop the ControlR app
sudo docker compose stop controlr

# Restore the database
cat controlr-backup-20250101.sql | sudo docker compose exec -T postgres psql -U controlr_admin controlr

# Start ControlR
sudo docker compose start controlr
```

### Restore from Volume Backup

```bash
# Stop services
sudo docker compose stop

# Restore the volume
sudo docker run --rm \
  -v controlr-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/controlr-backup-20250101.tar.gz -C /data

# Start services
sudo docker compose start
```

## Best Practices

- Schedule regular backups (daily recommended)
- Store backups off-site or in a separate location
- Test restore procedures periodically
- Keep at least 3 backup versions
- Encrypt backup files at rest
- Document your restore procedure for your team

## Next

- **[Docker Setup](/docs/admin/docker-setup)** — Container configuration
- **[Reverse Proxy](/docs/admin/reverse-proxy)** — HTTPS configuration
