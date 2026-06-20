---
sidebar_position: 0
title: Docker Setup
---

## Production Docker Configuration

For production deployments, consider these enhancements:

### Resource Limits

```yaml
services:
  controlr:
    image: bitbound/controlr:latest
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

### Health Checks

```yaml
services:
  controlr:
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5120/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

### Log Rotation

```yaml
services:
  controlr:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Backup

See the [Backup & Restore](/docs/admin/backup-restore) guide for database backup procedures.
