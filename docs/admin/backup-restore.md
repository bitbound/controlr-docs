---
sidebar_position: 3
title: Backup & Restore
---

## Database Backup

ControlR uses a database to store configuration, device information, and session data. Regular backups are essential.

### Manual Backup

```bash
# Stop the ControlR service
sudo docker compose stop controlr

# Backup the database volume
sudo docker run --rm \
  -v controlr_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/controlr-backup-$(date +%Y%m%d).tar.gz -C /data .

# Start ControlR again
sudo docker compose start controlr
```

### Automated Backup

Consider using a cron job or backup tool to automate database backups.

## Restoring from Backup

1. Stop ControlR
2. Restore the database files to the volume
3. Start ControlR

```bash
sudo docker compose stop controlr
sudo docker run --rm \
  -v controlr_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/controlr-backup-YYYYMMDD.tar.gz -C /data
sudo docker compose start controlr
```

## Best Practices

- Schedule regular backups (daily recommended)
- Store backups off-site
- Test restore procedures periodically
- Keep at least 3 backup versions
