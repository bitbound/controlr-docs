---
sidebar_position: 0
title: Docker Setup
---

## Production Docker Configuration

The snippets below are additions to the `controlr` service in the bundled Compose file. Merge them into the service that already exists there. Do not replace it, because it carries the database connection settings and the port mapping.

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

Check that the limit actually landed. `deploy` came from Swarm, and a Compose implementation that ignores it leaves the container uncapped.

```bash
docker inspect controlr --format '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}}'
```

Expect `1073741824 1000000000`. A `0` in either field means the limit was not applied. On such a host, use the service-level keys instead, which are not part of `deploy`.

```yaml
services:
  controlr:
    image: bitbound/controlr:latest
    mem_limit: 1g
    cpus: '1.0'
```

### Health Checks

You do not need one. The image already ships a `HEALTHCHECK` that runs `curl -f http://localhost:8080/health`, and `8080` is the port the app listens on inside the container. Adding a `healthcheck` block to the service replaces the image's version.

Before you write one, note what the image actually contains. It ships `curl` and no `wget`. A `wget` test fails every probe, and the container reports `unhealthy` while the application is serving traffic normally.

The health endpoint is anonymous and is mapped before the authentication middleware, which is why a plain probe works without a credential.

```yaml
services:
  controlr:
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

Use `8080`, not the published host port. The test runs inside the container, where `5120` is not listening.

Set `start_period` at or above the time a cold start needs. Startup applies database migrations before the app begins listening, so a tight window reports `unhealthy` during a normal start.

Compose has no health gate between the two services here, so ControlR can also exit once on a clean first start if it reaches Postgres before Postgres is ready. The `restart: unless-stopped` policy retries it.

To turn health checks off entirely:

```yaml
services:
  controlr:
    healthcheck:
      disable: true
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

### Persistent Postgres Data

The bundled Compose file mounts the named volume at `/var/lib/postgresql`, and that is the correct path for the `postgres:18` image it pins. In the Postgres 18 image, `PGDATA` moved to `/var/lib/postgresql/18/docker`, a child of that mount.

Do not "fix" the mount to the older `/var/lib/postgresql/data`. Under Postgres 18 that directory is no longer the data directory, so the volume holds nothing, the database lands in the container layer, and a `docker compose down` followed by `up` destroys it.

Confirm where the data actually lives. Expand the variable inside the container, where Compose sets it, rather than on your own command line.

```bash
docker compose exec postgres \
  sh -c 'psql -U "$POSTGRES_USER" -d controlr -tAc "SHOW data_directory;"'
```

The expected answer is `/var/lib/postgresql/18/docker`. If it points somewhere under `/var/lib/postgresql/data`, the mount in front of it is wrong and the database is not being persisted.

### File Transfer Limit

The comment in the bundled Compose file says to set `ControlR_AppOptions__MaxFileTransferSize` to `0` or less for no limit. Zero is wrong for the web interface. The server treats a value of zero or less as unlimited, but the browser only treats a negative value that way. At exactly `0` the web client refuses every upload and every download of a non-empty file before it sends a request, while the server would have accepted them.

Use a negative number for unlimited.

```yaml
services:
  controlr:
    environment:
      ControlR_AppOptions__MaxFileTransferSize: -1
```

## Backup

See the [Backup & Restore](/docs/admin/backup-restore) guide for database backup procedures.
