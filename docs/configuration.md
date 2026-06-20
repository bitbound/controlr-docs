---
sidebar_position: 3
title: Configuration
---

ControlR uses ASP.NET Core's standard configuration system. All values can be set via environment variables, Docker secrets, or the `appsettings.json` file.

## Configuration Prefix

When using environment variables, all ControlR configuration uses the `ControlR_` prefix. The double underscore (`__`) represents nested configuration sections.

For example:
- `ControlR_AppOptions__EnablePublicRegistration` maps to `AppOptions.EnablePublicRegistration`
- `ControlR_AppOptions__SmtpHost` maps to `AppOptions.SmtpHost`
- `ControlR_AppOptions__CorsAllowedOrigins__0` sets the first item in the `CorsAllowedOrigins` array

## Docker Secrets

When `ControlR_AppOptions__EnableDockerSecrets` is `true`, the application reads secrets from `/run/secrets` using ASP.NET Core's `AddKeyPerFile` configuration provider.

With Docker Secrets, you create files whose names map to configuration keys (minus the `ControlR_` prefix):
- A file named `AppOptions__SmtpPassword` overrides `ControlR_AppOptions__SmtpPassword`
- A file named `KeyProtectionOptions__CertificatePassword` overrides `ControlR_AppOptions__KeyProtectionOptions__CertificatePassword`

The PostgreSQL credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, etc.) use the `_FILE` suffix convention when sourced from Docker secrets (e.g., `ControlR_POSTGRES_USER_FILE: /run/secrets/POSTGRES_USER`).

## PostgreSQL Configuration

These environment variables configure the PostgreSQL database connection. They do **not** use the `ControlR_` prefix:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | Yes | — | PostgreSQL username |
| `POSTGRES_PASSWORD` | Yes | — | PostgreSQL password |
| `POSTGRES_HOST` | Yes | — | PostgreSQL host |
| `POSTGRES_DB` | No | `controlr` | Database name |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port |

## AppOptions

The main application settings section:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ControlR_AppOptions__AgentClockSkewTolerance` | TimeSpan? | `00:01:00` | Max allowed time difference between agent's signed timestamp and server time. `null` disables verification. |
| `ControlR_AppOptions__AgentInstallerKeyHistoryDays` | int | `90` | Days to retain installer key usage history. `<= 0` retains indefinitely. |
| `ControlR_AppOptions__AllowAgentsToSelfBootstrap` | bool | `false` | Agents can self-register without an installer key. |
| `ControlR_AppOptions__AuthenticatorIssuerName` | string? | `"ControlR"` | Name shown in TOTP authenticator apps for 2FA setup. |
| `ControlR_AppOptions__CorsAllowedOrigins__N` | string[] | `[]` | Array of allowed origins for CORS. Index by `N` (0, 1, 2...). |
| `ControlR_AppOptions__DefaultThemeMode` | string | `"Dark"` | Default theme for unauthenticated users (`"Dark"` or `"Light"`). Authenticated users have their own per-user theme preference. |
| `ControlR_AppOptions__DisableEmailSending` | bool | `false` | Disables ALL email sending (account confirmation, password reset, etc.). |
| `ControlR_AppOptions__DockerGatewayIp` | string? | Docker gateway | Gateway IP address for Docker environments, added to `KnownProxies`. |
| `ControlR_AppOptions__EnableCloudflareProxySupport` | bool | `false` | Auto-fetches Cloudflare IPs (`ips-v4` + `ips-v6`) and adds to `KnownNetworks`. |
| `ControlR_AppOptions__EnableCors` | bool | `false` | Enables CORS middleware. |
| `ControlR_AppOptions__EnableDatabaseDetailedErrors` | bool | `false` | Enables EF Core detailed error messages (debug only, may leak sensitive info). |
| `ControlR_AppOptions__EnableDockerSecrets` | bool | `false` | Reads secrets from `/run/secrets` via `AddKeyPerFile`. Windows not supported. |
| `ControlR_AppOptions__EnableInteractiveBearerLogin` | bool | `false` | Enables ASP.NET Core Identity interactive bearer-token login flow. |
| `ControlR_AppOptions__EnableNetworkTrust` | bool | `false` | Bypasses `KnownProxies`/`KnownNetworks` checks and trusts all forwarded headers. |
| `ControlR_AppOptions__EnablePublicRegistration` | bool | `false` | Allows public self-registration without an invitation. |
| `ControlR_AppOptions__EnableScalarUi` | bool | `false` | Serves the Scalar API reference UI and OpenAPI document. |
| `ControlR_AppOptions__EnableSignalrDetailedErrors` | bool | `false` | Sends detailed SignalR error messages to clients. |
| `ControlR_AppOptions__GitHubClientId` | string? | — | GitHub OAuth client ID. |
| `ControlR_AppOptions__GitHubClientSecret` | string? | — | GitHub OAuth client secret. |
| `ControlR_AppOptions__InMemoryDatabaseName` | string? | — | Name for the in-memory database when `UseInMemoryDatabase` is `true`. |
| `ControlR_AppOptions__InteractiveBearerTokenExpirationMinutes` | int | `60` | Access token lifetime for interactive bearer logins. |
| `ControlR_AppOptions__InteractiveRefreshTokenExpirationDays` | int | `30` | Refresh token lifetime for interactive bearer logins. |
| `ControlR_AppOptions__KnownNetworks__N` | string[] | `[]` | CIDR ranges trusted for forwarded headers. Index by `N`. |
| `ControlR_AppOptions__KnownProxies__N` | string[] | `[]` | Specific proxy IP addresses trusted for forwarded headers. Index by `N`. |
| `ControlR_AppOptions__MaxFileTransferSize` | long | `104857600` | Max file transfer size in bytes (100 MB default). `<= 0` for no limit. |
| `ControlR_AppOptions__MicrosoftClientId` | string? | — | Microsoft OAuth client ID. |
| `ControlR_AppOptions__MicrosoftClientSecret` | string? | — | Microsoft OAuth client secret. |
| `ControlR_AppOptions__PersistPasskeyLogin` | bool | `false` | Makes passkey login equivalent to "remember me". |
| `ControlR_AppOptions__RequireUserEmailConfirmation` | bool | `false` | Users must confirm email before logging in. Requires SMTP. |
| `ControlR_AppOptions__SmtpCheckCertificateRevocation` | bool | `true` | Checks SMTP server certificate revocation. |
| `ControlR_AppOptions__SmtpDisplayName` | string? | — | Display name in outgoing emails. |
| `ControlR_AppOptions__SmtpEmail` | string? | — | Sender email address for outgoing emails. |
| `ControlR_AppOptions__SmtpHost` | string? | — | SMTP server hostname/IP. |
| `ControlR_AppOptions__SmtpLocalDomain` | string? | — | Local domain for SMTP. |
| `ControlR_AppOptions__SmtpPassword` | string? | — | SMTP authentication password. |
| `ControlR_AppOptions__SmtpPort` | int | `587` | SMTP port (submission port). |
| `ControlR_AppOptions__SmtpUserName` | string? | — | SMTP authentication username. |
| `ControlR_AppOptions__UseHttpLogging` | bool | `false` | Enables HTTP request/response logging. |
| `ControlR_AppOptions__UseInMemoryDatabase` | bool | `false` | Uses EF Core in-memory DB instead of PostgreSQL (dev/test only). |

## Bootstrap Options

These settings create the first admin user on server startup. They only take effect when no users exist in the database:

| Variable | Type | Description |
|----------|------|-------------|
| `ControlR_Bootstrap__AdminEmail` | string? | Admin user email (used as both username and email) |
| `ControlR_Bootstrap__AdminPassword` | string? | Admin user password (8+ characters required) |
| `ControlR_Bootstrap__AdminPatTokenId` | string? | Pre-assigned GUID for the bootstrap PAT |
| `ControlR_Bootstrap__AdminPatSecret` | string? | Pre-shared secret for the bootstrap PAT |

Both `AdminEmail` and `AdminPassword` must be set together. If both are set but users already exist, bootstrap is skipped.

## Key Protection Options

Configure X.509 certificate-based encryption for Data Protection keys at rest:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ControlR_KeyProtectionOptions__CertificateContentsBase64` | string? | — | Base64-encoded PFX certificate contents. Takes precedence over `CertificatePath`. |
| `ControlR_KeyProtectionOptions__CertificatePassword` | string? | — | Password for password-protected PFX. |
| `ControlR_KeyProtectionOptions__CertificatePath` | string? | — | File path to PFX certificate. Mount the certificate into the container. |
| `ControlR_KeyProtectionOptions__EncryptKeys` | bool | `false` | When `true`, Data Protection keys are encrypted at rest using the specified certificate. |

## Aspire Dashboard Options

| Variable | Type | Description |
|----------|------|-------------|
| `ControlR_AspireDashboard__PublicWebUrl` | Uri? | Public URL for the Aspire Dashboard web interface |
| `ControlR_AspireDashboard__Token` | string? | Access token for the Aspire Dashboard |

## Server Lifecycle Options

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ControlR_ServerLifecycle__DecommissionServer` | bool | `false` | **Dangerous:** When `true`, agents auto-uninstall when they connect. Use only during server teardown. |

## Logging Configuration

ControlR uses ASP.NET Core's standard logging levels. Configure specific log sources:

| Variable | Description |
|----------|-------------|
| `ControlR_Logging__LogLevel__Default` | Minimum log level for all logs (default: `Information`) |
| `ControlR_Logging__LogLevel__Microsoft.AspNetCore` | Log level for ASP.NET Core framework logs |
| `ControlR_Logging__LogLevel__Microsoft.AspNetCore.HttpLogging` | Log level for HTTP logging middleware |
| `ControlR_Logging__LogLevel__Microsoft.AspNetCore.HttpOverrides` | Log level for forwarded headers middleware (set to `Debug` to troubleshoot proxy trust issues) |
| `ControlR_Logging__LogLevel__Microsoft.EntityFrameworkCore.Database` | Log level for EF Core database operations |

## OpenTelemetry Configuration

| Variable | Description |
|----------|-------------|
| `ControlR_OTLP_ENDPOINT_URL` | OTLP endpoint URL for gRPC export (e.g., `http://aspire:18889`) |
| `ControlR_AzureMonitor__ConnectionString` | Azure Monitor connection string for Application Insights export |

## Tenant Settings

These settings are stored in the database (not via environment variables) and managed through the web UI at `/tenant-settings`:

| Setting Name | Type | Description |
|--------------|------|-------------|
| `append-instance-id` | bool | Whether to append instance ID to device names |
| `instance-id` | string | Instance identifier string for multi-server agent installations |
| `notify-user-on-session-start` | bool | Whether to notify the remote user when a session starts |

Settings are validated: name must match `[a-zA-Z0-9-]`, value must match `[a-zA-Z0-9-_. ]`, max length 100 each.

## Agent Configuration

Agents read configuration from `appsettings.json` on the target device. The file is written automatically during installation and contains:

```json
{
  "AppOptions": {
    "DeviceId": "<device-guid>",
    "PrivateKey": "<base64-ed25519-key>",
    "ServerUri": "https://your-server.example.com",
    "TenantId": "<tenant-guid>"
  }
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `DeviceId` | Guid | Yes | Unique device identifier (assigned during install) |
| `PrivateKey` | string | Yes | Base64-encoded Ed25519 private key for agent authentication |
| `ServerUri` | Uri | Yes | URL of the ControlR server |
| `TenantId` | Guid | Yes | Tenant identifier |
| `InstanceId` | string? | No | Per-installation instance identifier (for multi-instance setups) |
| `DisableAutoUpdate` | bool | No | Disables the agent's automatic update check (default: `false`) |

**Configuration file locations:**

| Platform | Elevated (root/SYSTEM) | Non-elevated (user) |
|----------|----------------------|---------------------|
| Windows | `C:\ProgramData\ControlR\<instanceId>\appsettings.json` | N/A |
| Linux | `/etc/controlr/<instanceId>/appsettings.json` | `~/.controlr/<instanceId>/appsettings.json` |
| macOS | `/etc/controlr/<instanceId>/appsettings.json` | `~/.controlr/<instanceId>/appsettings.json` |

## Example: Complete Docker Compose Configuration

Here's a production-ready example with common settings:

```yaml
services:
  controlr:
    image: bitbound/controlr:latest
    container_name: controlr
    restart: unless-stopped
    ports:
      - "5120:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_HTTP_PORTS: 8080

      # PostgreSQL
      ControlR_POSTGRES_HOST: postgres
      ControlR_POSTGRES_USER: postgres
      ControlR_POSTGRES_PASSWORD: changeme
      ControlR_POSTGRES_DB: controlr

      # Admin bootstrap (only on first startup)
      ControlR_Bootstrap__AdminEmail: admin@example.com
      ControlR_Bootstrap__AdminPassword: SecureP@ssw0rd

      # Public registration (set to true if you want open signup)
      ControlR_AppOptions__EnablePublicRegistration: false

      # Allow agents to self-register without installer keys
      ControlR_AppOptions__AllowAgentsToSelfBootstrap: false

      # Email confirmation required for new accounts
      ControlR_AppOptions__RequireUserEmailConfirmation: true

      # SMTP configuration
      ControlR_AppOptions__SmtpHost: smtp.gmail.com
      ControlR_AppOptions__SmtpPort: 587
      ControlR_AppOptions__SmtpEmail: noreply@example.com
      ControlR_AppOptions__SmtpDisplayName: ControlR
      ControlR_AppOptions__SmtpUserName: noreply@example.com
      ControlR_AppOptions__SmtpPassword: smtp-password-here

      # Reverse proxy support
      ControlR_AppOptions__EnableCloudflareProxySupport: false
      # ControlR_AppOptions__EnableNetworkTrust: true  # Only if proxy is guaranteed secure

      # Aspire Dashboard (telemetry)
      ControlR_AspireDashboard__PublicWebUrl: http://localhost:18888

      # CORS (if needed)
      # ControlR_AppOptions__EnableCors: true
      # ControlR_AppOptions__CorsAllowedOrigins__0: https://app.example.com
```

## Next Steps

- **[Reverse Proxy](/docs/admin/reverse-proxy)** — Configure HTTPS with a reverse proxy
- **[Docker Setup](/docs/admin/docker-setup)** — Advanced Docker configuration
- **[Native Installation](/docs/admin/native-installation)** — Deploy without Docker
