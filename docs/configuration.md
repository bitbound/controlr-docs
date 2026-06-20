---
sidebar_position: 3
title: Configuration
---

ControlR is configured primarily through environment variables in your Docker Compose setup.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTROLR__Database__ConnectionString` | Yes | Database connection string |
| `CONTROLR__Auth__JwtSecret` | Yes | Secret key for JWT token signing |
| `CONTROLR__Server__Port` | No | Port to listen on (default: `5120`) |
| `CONTROLR__Server__BaseUrl` | No | Base URL for the application |
| `CONTROLR__Logging__LogLevel` | No | Minimum log level (default: `Information`) |

## Docker Secrets

For production deployments, use Docker Secrets instead of plain environment variables:

```yaml
services:
  controlr:
    secrets:
      - db_connection
      - jwt_secret

secrets:
  db_connection:
    file: ./secrets/db_connection.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

## Configuration File

For detailed configuration options, refer to the [ControlR repository README](https://github.com/bitbound/ControlR#readme).

## Next Steps

- **[Reverse Proxy](/docs/admin/reverse-proxy)** — Configure your web server
- **[Docker Setup](/docs/admin/docker-setup)** — Advanced Docker configuration
