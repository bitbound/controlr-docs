---
sidebar_position: 4
title: Configuration
---

ControlR uses ASP.NET Core's standard `IConfiguration` system. All values can be set via environment variables, Docker secrets, or the `appsettings.json` file.

## Configuration Prefix

The server reads environment variables from two providers.

1. The ASP.NET Core default provider. It loads every environment variable that is not prefixed with `ASPNETCORE_` or `DOTNET_`.
2. A ControlR-specific provider registered with the `ControlR_` prefix. The prefix is stripped when the keys are read.

Both forms bind. `ControlR_AppOptions__SmtpHost` and `AppOptions__SmtpHost` reach the same key. The prefixed provider is registered last, so it wins when both are set for the same key.

The double underscore (`__`) is the nesting separator. It becomes a colon internally.

- `ControlR_AppOptions__EnablePublicRegistration` maps to `AppOptions:EnablePublicRegistration`
- `ControlR_AppOptions__SmtpHost` maps to `AppOptions:SmtpHost`
- `ControlR_AppOptions__CorsAllowedOrigins__0` sets the first item in the `CorsAllowedOrigins` array

Section names are load-bearing. Only keys that live under `AppOptions` take the `AppOptions__` segment. `KeyProtectionOptions`, `Bootstrap`, `ServerLifecycle`, `DeveloperOptions`, `AspireDashboard`, `Logging`, `AzureMonitor`, `AllowedHosts`, and the `POSTGRES_*` keys are root sections. A key placed under the wrong section binds nothing and fails silently.

## Docker Secrets

When `ControlR_AppOptions__EnableDockerSecrets` is `true`, the application reads secrets from `/run/secrets` using ASP.NET Core's `AddKeyPerFile` configuration provider. The directory must exist, because the provider is registered with `optional: false`.

Set the flag itself with an environment variable or in `appsettings.json`. The provider is added after that flag is read, so a file in `/run/secrets` cannot turn the feature on.

Secret file names are configuration keys. They use `__` as the nesting separator and carry no `ControlR_` prefix:
- A file named `AppOptions__SmtpPassword` sets `AppOptions:SmtpPassword`
- A file named `KeyProtectionOptions__CertificatePassword` sets `KeyProtectionOptions:CertificatePassword`. `KeyProtectionOptions` is a root section. There is no `AppOptions:KeyProtectionOptions` key, so a file aimed at that path binds nothing.
- A file named `POSTGRES_USER` sets `POSTGRES_USER`

The secrets provider is registered after both environment-variable providers. A secret file wins over an environment variable of the same key.

## PostgreSQL Configuration

The server reads these root-level config keys: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, and optionally `POSTGRES_USE_ENTRA_ID`. The prefixed and unprefixed environment variable forms both work, so a Docker host can set `ControlR_POSTGRES_USER` while an `appsettings.json` file puts the key directly under `POSTGRES_USER`. The prefixed form wins if both are set.

The shipped `appsettings.json` supplies the defaults below. Startup throws when `POSTGRES_USER` or `POSTGRES_HOST` is blank, and throws when `POSTGRES_PASSWORD` is blank while Entra ID authentication is off.

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `POSTGRES_USER` | Yes | `postgres` | PostgreSQL username. Prefix form: `ControlR_POSTGRES_USER` |
| `POSTGRES_PASSWORD` | Yes, unless using Entra ID | None | PostgreSQL password. Shipped as `null` |
| `POSTGRES_HOST` | Yes | `localhost` | PostgreSQL host. May be an absolute URI such as `https://mydb.postgres.database.azure.com`, in which case the host and port are taken from the URI |
| `POSTGRES_DB` | No | `controlr` | Database name. Blank also resolves to `controlr` |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port. A non-numeric value falls back to `5432`. A URI in `POSTGRES_HOST` overrides it |
| `POSTGRES_USE_ENTRA_ID` | No | `false` | Set to `true` to authenticate to Azure Database for PostgreSQL with Entra ID instead of a password. Requires the `DefaultAzureCredential` chain |

## AppOptions

The main application settings section. It is bound from the `AppOptions` section, so the environment variable form is always `ControlR_AppOptions__<Key>`.

The Default column shows what an operator actually gets. Most keys are set explicitly in the shipped `appsettings.json`. Five keys are absent from that file and fall back to the C# initializer: `AuthorizationChangeLogRetentionDays` (365), `ExternalUserCleanupAfterDays` (30), `LogonTokenGrantCleanupAfterDays` (21), `ServiceAccountAuthFailureLimit` (5), and `ServiceAccountAuthFailureWindowMinutes` (5). String options ship as empty strings, which read the same as unset.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ControlR_AppOptions__AgentClockSkewTolerance` | TimeSpan? | `00:01:00` | Max allowed time difference between agent's signed timestamp and server time. `null` disables verification |
| `ControlR_AppOptions__AgentInstallerKeyHistoryDays` | int | `90` | Days to retain installer key usage history. `<= 0` retains indefinitely |
| `ControlR_AppOptions__AuthenticatorIssuerName` | string? | `ControlR` | Name shown in TOTP authenticator apps for 2FA setup |
| `ControlR_AppOptions__AuthorizationChangeLogRetentionDays` | int | `365` | Days to keep authorization change log entries. A background service prunes older rows. `<= 0` disables pruning |
| `ControlR_AppOptions__CorsAllowedOrigins__N` | string[] | `[]` | Array of allowed origins for CORS. Index by `N` (0, 1, 2...). Used only when `EnableCors` is `true` |
| `ControlR_AppOptions__DefaultThemeMode` | ThemeMode | `Dark` | Default theme for unauthenticated users. Accepts `Auto`, `Light`, or `Dark`, case-insensitive. The shipped `appsettings.json` sets `Dark`, and that is what a running server uses. The C# default is the enum zero value, `Auto`, and applies only if the key is removed from configuration entirely. Authenticated users have their own per-user theme preference |
| `ControlR_AppOptions__DisableDesktopPreview` | bool | `false` | Hides the Desktop Preview button on the Remote Control page and makes the desktop preview endpoint refuse requests |
| `ControlR_AppOptions__DisableEmailSending` | bool | `false` | Disables ALL email sending (account confirmation, password reset, etc.) |
| `ControlR_AppOptions__DisableFirstUserSelfRegistration` | bool | `false` | Disables the one-time first-user self-registration bootstrap. Set `true` with `EnablePublicRegistration: false` for service-account-only deployments. Independent of `EnablePublicRegistration` |
| `ControlR_AppOptions__DisableMainUi` | bool | `false` | Hides the main UI. Only the device access pages remain; every other page route, including the account pages, renders not-found, and unauthenticated visits to a gated page land on a chrome-free `/unauthorized` sign-in page. API endpoints are unaffected. For instances an external application manages through the API |
| `ControlR_AppOptions__DockerGatewayIp` | string? | None | A single IP address that is added to `KnownProxies` at startup. The shipped `appsettings.json` is an empty string, which adds nothing, and there is no gateway default in source. A value that does not parse as an IP address is logged and skipped. The repo `docker-compose.yml` sets `::ffff:172.29.0.1` to match its fixed `172.29.0.0/16` network, so a compose deployment gets that value |
| `ControlR_AppOptions__EnableCloudflareProxySupport` | bool | `false` | Fetches Cloudflare's `ips-v4` and `ips-v6` lists at startup and adds both ranges to `KnownNetworks`. Each list is fetched on its own, and a Cloudflare endpoint that is unreachable or returns an error status aborts startup. See [Reverse Proxy](/docs/admin/reverse-proxy) |
| `ControlR_AppOptions__EnableCors` | bool | `false` | Enables CORS middleware |
| `ControlR_AppOptions__EnableDatabaseDetailedErrors` | bool | `false` | Enables EF Core detailed error messages (debug only, may leak sensitive info) |
| `ControlR_AppOptions__EnableDockerSecrets` | bool | `false` | Reads secrets from `/run/secrets` via `AddKeyPerFile`. Windows not supported |
| `ControlR_AppOptions__EnableInteractiveBearerLogin` | bool | `false` | Enables ASP.NET Core Identity interactive bearer-token login flow |
| `ControlR_AppOptions__EnableNetworkTrust` | bool | `false` | Trusts the forwarded `X-Forwarded-For` and `X-Forwarded-Proto` headers from any address, clearing the `KnownProxies`/`KnownNetworks` allowlist. Host and path-prefix headers are still never read |
| `ControlR_AppOptions__EnablePublicRegistration` | bool | `false` | Allows public self-registration without an invitation. Independent of `DisableFirstUserSelfRegistration` |
| `ControlR_AppOptions__EnableScalarUi` | bool | `false` | Serves the Scalar API reference UI and OpenAPI document |
| `ControlR_AppOptions__EnableSignalrDetailedErrors` | bool | `false` | Sends detailed SignalR error messages to clients |
| `ControlR_AppOptions__ExternalUserCleanupAfterDays` | int | `30` | Days after which external user accounts with no recent login activity are purged by a background service. `<= 0` disables cleanup. Accounts that never logged in are not removed |
| `ControlR_AppOptions__GitHubClientId` | string? | None | GitHub OAuth client ID |
| `ControlR_AppOptions__GitHubClientSecret` | string? | None | GitHub OAuth client secret |
| `ControlR_AppOptions__InMemoryDatabaseName` | string? | None | Name for the in-memory database when `UseInMemoryDatabase` is `true`. When blank, each run gets a random name, so data does not survive a restart |
| `ControlR_AppOptions__InteractiveBearerTokenExpirationMinutes` | int | `60` | Access token lifetime for interactive bearer logins |
| `ControlR_AppOptions__InteractiveRefreshTokenExpirationDays` | int | `30` | Refresh token lifetime for interactive bearer logins |
| `ControlR_AppOptions__KnownNetworks__N` | string[] | `[]` | CIDR ranges trusted for forwarded headers. Index by `N` |
| `ControlR_AppOptions__KnownProxies__N` | string[] | `[]` | Specific proxy IP addresses trusted for forwarded headers. Index by `N` |
| `ControlR_AppOptions__LogonTokenGrantCleanupAfterDays` | int | `21` | Days after which orphaned logon-token permission grant rows are deleted by a background service. Keep it above the longest token lifetime plus the longest session lifetime. `<= 0` disables cleanup |
| `ControlR_AppOptions__MaxFileTransferSize` | long | `104857600` | Max file transfer size in bytes (100 MiB). **Use a negative value for unlimited.** The server treats `<= 0` as unlimited, but the web client treats only `< 0` as unlimited. A value of exactly `0` makes the browser reject every upload and every download of a non-empty file before it sends a request. Also sets the multipart body length limit |
| `ControlR_AppOptions__MicrosoftClientId` | string? | None | Microsoft OAuth client ID |
| `ControlR_AppOptions__MicrosoftClientSecret` | string? | None | Microsoft OAuth client secret |
| `ControlR_AppOptions__PersistPasskeyLogin` | bool | `false` | Makes passkey login equivalent to "remember me" |
| `ControlR_AppOptions__PublicBaseUrl` | string? | None | The absolute URL this server is reachable at by its users, e.g. `https://controlr.example.com`. Every link in an outbound account email is built from it. See Email links in account emails below |
| `ControlR_AppOptions__RequireUserEmailConfirmation` | bool | `false` | Users must confirm email before logging in. Requires SMTP |
| `ControlR_AppOptions__RequireUserUniqueEmail` | bool | `true` | Whether each user must have a unique email address across all tenants |
| `ControlR_AppOptions__ServiceAccountAuthFailureLimit` | int | `5` | Maximum failed `x-api-key` authentication attempts allowed per rate-limit window. Tracked separately per source IP and per credential. `0` or less does not turn the limiter off. It lets one failure through, then rejects that IP or credential for the rest of the window |
| `ControlR_AppOptions__ServiceAccountAuthFailureWindowMinutes` | int | `5` | Fixed window size (minutes) for the service-account authentication rate limiter. Failed attempts stay counted for this long |
| `ControlR_AppOptions__ServiceAccountCredentialCleanupAfterDays` | int | `30` | Days after which revoked or expired service account credentials are permanently deleted by a background service. Covers server-scoped and tenant-scoped credentials. `<= 0` disables cleanup |
| `ControlR_AppOptions__SmtpCheckCertificateRevocation` | bool | `true` | Checks SMTP server certificate revocation |
| `ControlR_AppOptions__SmtpDisplayName` | string? | None | Display name in outgoing emails |
| `ControlR_AppOptions__SmtpEmail` | string? | None | Sender email address for outgoing emails |
| `ControlR_AppOptions__SmtpHost` | string? | None | SMTP server hostname/IP |
| `ControlR_AppOptions__SmtpLocalDomain` | string? | None | Local domain for SMTP |
| `ControlR_AppOptions__SmtpPassword` | string? | None | SMTP authentication password |
| `ControlR_AppOptions__SmtpPort` | int | `587` | SMTP port (submission port) |
| `ControlR_AppOptions__SmtpUserName` | string? | None | SMTP authentication username |
| `ControlR_AppOptions__UseHttpLogging` | bool | `false` | Enables HTTP request/response logging |
| `ControlR_AppOptions__UseInMemoryDatabase` | bool | `false` | Uses EF Core in-memory DB instead of PostgreSQL (dev/test only) |

### Email links in account emails

Every link the server puts into an email (password reset, email confirmation, email change) is built from `PublicBaseUrl`, never from the arriving request. A request can carry a forged `Host` or `X-Forwarded-Host`, and a link built from that would deliver a genuine email carrying a valid token to a host the caller picked.

There is no request-origin fallback. When `PublicBaseUrl` is unset or unusable, no account-email link is built, and the actions that depend on such a link do not half-succeed:

- A password-reset request fails instead of sending an email, because the server has no trustworthy origin to put in front of the reset token.
- Confirmation emails are not sent, and the server logs an error where it declined one.

The server prints a warning at startup when `PublicBaseUrl` is unset or unusable. Set `PublicBaseUrl` to get clickable links and working password resets. A configured value that is not an absolute `http` or `https` URL is rejected, logged, and treated as unset. Pinning `AllowedHosts` does not enable these links; only `PublicBaseUrl` does.

### File transfer size

`MaxFileTransferSize` is enforced in two places, and they do not agree on zero.

- Server endpoints and hubs skip the check when the value is not greater than zero, so `0` and any negative value mean unlimited to the server.
- The web client substitutes `long.MaxValue` only when the value is less than zero. It compares file sizes against the raw value otherwise.

A limit of exactly `0` therefore lets the server accept a transfer while the browser blocks it. Use `-1` for unlimited.

## Host Filtering

`AllowedHosts` is a root-level key, enforced by ASP.NET Core's host-filtering middleware. `WebApplication.CreateBuilder` registers that middleware automatically, so the setting takes effect with no ControlR code involved.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AllowedHosts` | string[] | `*` | Semicolon-separated hostnames the server answers to, without port numbers. A request whose `Host` is not in the list is rejected with `400 Bad Request` before it reaches the app. `*` accepts any host. Prefix form: `ControlR_AllowedHosts` |

Pinning the list rejects a request carrying a forged `Host` with `400 Bad Request` instead of serving it. It does not affect account-email links, which are built only from `PublicBaseUrl` (see Email links in account emails above).

The shipped `appsettings.json` sets `AllowedHosts` to `*`, so a default deployment accepts any host, and until `PublicBaseUrl` is set a password-reset request fails and the link-bearing account emails are refused rather than sent without a link.

## Bootstrap Options

These settings create the first admin user on server startup. They only take effect when no users exist in the database:

| Variable | Type | Description |
|----------|------|-------------|
| `ControlR_Bootstrap__AdminEmail` | string? | Admin user email (used as both username and email) |
| `ControlR_Bootstrap__AdminPassword` | string? | Admin user password (8+ characters required) |
| `ControlR_Bootstrap__AdminPatTokenId` | string? | Pre-assigned GUID for the bootstrap PAT |
| `ControlR_Bootstrap__AdminPatSecret` | string? | Pre-shared secret for the bootstrap PAT |
| `ControlR_Bootstrap__ServerServiceAccountName` | string? | Name for the bootstrapped server-scoped service account. Set alongside `ServerServiceAccountTokenId` and `ServerServiceAccountTokenSecret` to create on first startup |
| `ControlR_Bootstrap__ServerServiceAccountDescription` | string? | Human-readable description for the bootstrapped service account |
| `ControlR_Bootstrap__ServerServiceAccountId` | Guid? | Pre-assigned deterministic GUID for the service account entity. Lets automation consumers hardcode the account ID without a discovery API call |
| `ControlR_Bootstrap__ServerServiceAccountTokenId` | Guid? | Pre-assigned deterministic GUID for the initial credential. The resulting `x-api-key` header is `{hex-guid}:{ServerServiceAccountTokenSecret}` |
| `ControlR_Bootstrap__ServerServiceAccountTokenSecret` | string? | Pre-shared secret for the initial credential. The resulting `x-api-key` header is `{hex-guid}:{secret}` |

Both `AdminEmail` and `AdminPassword` must be set together. If only one is set, startup throws. If both are set but users already exist, bootstrap is skipped. `AdminPatTokenId` and `AdminPatSecret` must both be set for the PAT to be created, otherwise PAT creation is skipped.

For server service accounts, `ServerServiceAccountName`, `ServerServiceAccountTokenId`, and `ServerServiceAccountTokenSecret` must all be set together. Partial configuration fails startup. If the named account already exists, bootstrap skips.

## Key Protection Options

Configure X.509 certificate-based encryption for Data Protection keys at rest. `KeyProtectionOptions` is a root configuration section. It is not nested under `AppOptions`.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ControlR_KeyProtectionOptions__CertificateContentsBase64` | string? | None | Base64-encoded PFX certificate contents. Takes precedence over `CertificatePath` |
| `ControlR_KeyProtectionOptions__CertificatePassword` | string? | None | Password for password-protected PFX |
| `ControlR_KeyProtectionOptions__CertificatePath` | string? | None | File path to PFX certificate. Mount the certificate into the container |
| `ControlR_KeyProtectionOptions__EncryptKeys` | bool | `false` | When `true`, Data Protection keys are encrypted at rest using the specified certificate. Startup throws if neither certificate option is configured or the file does not exist |

## Aspire Dashboard Options

Root section `AspireDashboard`.

| Variable | Type | Description |
|----------|------|-------------|
| `ControlR_AspireDashboard__PublicWebUrl` | Uri? | Public URL for the Aspire Dashboard web interface |
| `ControlR_AspireDashboard__Token` | string? | Access token for the Aspire Dashboard |

## Server Lifecycle Options

Root section `ServerLifecycle`.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ControlR_ServerLifecycle__DecommissionServer` | bool | `false` | **Dangerous.** When `true`, agents auto-uninstall when they connect. Use only during server teardown |

### Decommission Mode (Server Teardown)

The `DecommissionServer` option permanently decommissions a ControlR server instance. When enabled, any agent that connects to the server receives an **immediate uninstall command** and is removed from the server. Use this when you are permanently shutting down a ControlR instance and want all connected agents to cleanly uninstall themselves.

**⚠️ Warning:** This is a destructive, irreversible action. Once an agent self-uninstalls, it will need to be reinstalled to reconnect to any server.

**How it works:**

1. Set `ControlR_ServerLifecycle__DecommissionServer: true` on the server
2. Existing agents connect and receive the uninstall command
3. Agents uninstall themselves from their host machines
4. The process repeats until all agents are removed

**Checking decommission status:**

The web UI displays a decommission indicator. You can also check programmatically:

```bash
curl https://your-server/api/v1/user-server-settings/decommission-status \
  -H "x-personal-token: <tokenId>:<secret>"
```

The unversioned route `/api/user-server-settings/decommission-status` still responds, but it is marked deprecated in the OpenAPI document in favor of the `/api/v1/` route above. Use the versioned route in new automation.

**After decommissioning:**

Once all agents have been removed, you can safely stop the server containers and delete any remaining resources (volumes, etc.).

## Developer Options

Root section `DeveloperOptions`. These settings are for development and load testing only. Never enable one on a server that users can reach. The server prints a warning at startup while any of them is on.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ControlR_DeveloperOptions__AllowAgentsToSelfBootstrap` | bool | `false` | Registers an unknown device when it connects, instead of requiring an installer key. Development and load testing only |

### AllowAgentsToSelfBootstrap and tenants

The setting only matters when the connecting agent presents no tenant. In that case the server requires exactly one tenant to exist and places the device in it. With two or more tenants the connection is refused with `Self-bootstrap is only allowed on single-tenant servers. Use an installer key instead.` An agent that presents a valid tenant ID is not affected by this setting.

So this is a development and load-testing tool, not a way to skip installer keys in production. Never enable it on a server that users can reach. Multi-tenant deployments must use installer keys, which carry an explicit tenant.

## Logging Configuration

ControlR uses ASP.NET Core's standard logging levels. `Logging` is a root configuration section. Configure specific log sources:

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
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Unprefixed standard OTLP endpoint. It takes precedence over `ControlR_OTLP_ENDPOINT_URL` when both are set |
| `ControlR_AzureMonitor__ConnectionString` | Azure Monitor connection string for Application Insights export. Root section `AzureMonitor` |

## Tenant Settings

These settings are stored in the database (not via environment variables) and managed through the web UI at `/tenant-settings`:

| Setting Name | Type | Description |
|--------------|------|-------------|
| `append-instance-id` | bool | Whether to append instance ID to device names |
| `instance-id` | string | Instance identifier string for multi-server agent installations |
| `notify-user-on-session-start` | bool | Whether to notify the remote user when a session starts |

Settings are validated: name must match `[a-zA-Z0-9-]`, value must match `[a-zA-Z0-9-_. ]`, max length 100 each. The `instance-id` value has extra rules on top of the pattern. It may not be `default`, `.`, or `..`, and it may not contain path separators.

## Agent Configuration

Agents read configuration from `appsettings.json` on the target device. The installer writes the file, and the agent rewrites the `AppOptions` node in it whenever its device ID or key changes.

The keys live in three different sections. `InstanceId` and `DisableAutoUpdate` do not belong under `AppOptions`. Placed there, they bind nothing and are silently ignored.

```json
{
  "AppOptions": {
    "DeviceId": "<device-guid>",
    "PrivateKey": "<base64-ed25519-key>",
    "ServerUri": "https://your-server.example.com",
    "TenantId": "<tenant-guid>"
  },
  "InstanceOptions": {
    "InstanceId": "<instance-id>"
  },
  "Developer": {
    "DisableAutoUpdate": true
  }
}
```

| Property | Section | Type | Required | Description |
|----------|---------|------|----------|-------------|
| `DeviceId` | `AppOptions` | Guid | Yes | Unique device identifier (assigned during install) |
| `PrivateKey` | `AppOptions` | string | Yes | Base64-encoded Ed25519 private key for agent authentication |
| `ServerUri` | `AppOptions` | Uri | Yes | URL of the ControlR server |
| `TenantId` | `AppOptions` | Guid | Yes | Tenant identifier |
| `InstanceId` | `InstanceOptions` | string? | No | Per-installation instance identifier (for multi-instance setups). Defaults to `default` |
| `DisableAutoUpdate` | `Developer` | bool | No | Disables the agent's automatic update check (default: `false`) |

The agent does not use a configuration prefix. Its environment variables are `AppOptions__ServerUri`, `InstanceOptions__InstanceId`, and `Developer__DisableAutoUpdate`.

Configuration sources are layered, and the last one wins: command-line values supplied at startup, then environment variables, then the `appsettings.json` file at the paths below. A hand-edit to the JSON file overrides an environment variable of the same key.

`InstanceId` selects the settings directory, so it must match the directory the agent is installed into. Prefer the installer's instance argument over editing this key.

The agent rewrites only the `AppOptions` node of the file. Hand-added `InstanceOptions` and `Developer` sections survive those rewrites.

**Configuration file locations:**

| Platform | Elevated (root/SYSTEM) | Non-elevated (user) |
|----------|----------------------|---------------------|
| Windows | `C:\ProgramData\ControlR\<instanceId>\appsettings.json` | N/A |
| Linux | `/etc/controlr/<instanceId>/appsettings.json` | `~/.controlr/<instanceId>/appsettings.json` |
| macOS | `/etc/controlr/<instanceId>/appsettings.json` | `~/.controlr/<instanceId>/appsettings.json` |

## Example: Complete Docker Compose Configuration

Here's a production-ready example with common settings. Sensitive values should come from your host environment, a `.env` file, or Docker secrets rather than being hardcoded. See the [`docker-compose.yml` in the ControlR repo](https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose.yml) for the canonical file.

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

      # PostgreSQL. Root-level keys, so the ControlR_ prefix is optional here.
      # The prefixed form wins if both forms are set.
      ControlR_POSTGRES_HOST: postgres
      ControlR_POSTGRES_USER: postgres
      ControlR_POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?error}
      ControlR_POSTGRES_DB: controlr
      ControlR_POSTGRES_PORT: 5432

      # Admin bootstrap (only effective when the user table is empty)
      ControlR_Bootstrap__AdminEmail: ${BOOTSTRAP_ADMIN_EMAIL:?error}
      ControlR_Bootstrap__AdminPassword: ${BOOTSTRAP_ADMIN_PASSWORD:?error}

      # Public registration (set to true if you want open signup)
      ControlR_AppOptions__EnablePublicRegistration: false

      # The absolute URL this server is reachable at by its users. Every link
      # in an account email (password reset, email confirmation, email change)
      # is built from it, and only from it. Unset, no account-email link is
      # produced and a password-reset request fails outright.
      ControlR_AppOptions__PublicBaseUrl: https://your-server.example.com

      # The hostnames this server answers to. A request carrying any other
      # Host gets a 400. Pinning it does not affect account-email links, which
      # are built only from PublicBaseUrl above. "*" accepts any host.
      ControlR_AllowedHosts: your-server.example.com

      # DEVELOPMENT AND LOAD TESTING ONLY. Never enable on a server that users
      # can reach. Lets an agent register itself without an installer key, and
      # the server prints a warning at startup while it is on.
      ControlR_DeveloperOptions__AllowAgentsToSelfBootstrap: false

      # Email confirmation required for new accounts
      ControlR_AppOptions__RequireUserEmailConfirmation: true

      # File transfer limit in bytes. Use -1 for unlimited, not 0.
      ControlR_AppOptions__MaxFileTransferSize: 104857600

      # Default theme for unauthenticated users: Auto, Light, or Dark.
      ControlR_AppOptions__DefaultThemeMode: Dark

      # SMTP configuration
      ControlR_AppOptions__SmtpHost: smtp.gmail.com
      ControlR_AppOptions__SmtpPort: 587
      ControlR_AppOptions__SmtpEmail: noreply@example.com
      ControlR_AppOptions__SmtpDisplayName: ControlR
      ControlR_AppOptions__SmtpUserName: noreply@example.com
      ControlR_AppOptions__SmtpPassword: ${SMTP_PASSWORD:?error}

      # Reverse proxy support. Set this to your proxy's address, or use
      # EnableNetworkTrust only if the proxy is guaranteed secure.
      # ControlR_AppOptions__DockerGatewayIp: "::ffff:172.29.0.1"
      # ControlR_AppOptions__KnownProxies__0: 172.29.0.2
      ControlR_AppOptions__EnableCloudflareProxySupport: false
      # ControlR_AppOptions__EnableNetworkTrust: true

      # Data Protection key encryption. Root section, not under AppOptions.
      ControlR_KeyProtectionOptions__EncryptKeys: false
      # ControlR_KeyProtectionOptions__CertificatePath: /certs/controlr.pfx
      # ControlR_KeyProtectionOptions__CertificatePassword: ${PFX_PASSWORD}

      # Aspire Dashboard (telemetry)
      ControlR_AspireDashboard__PublicWebUrl: ${ASPIRE_PUBLIC_URL:-http://localhost:18888}

      # CORS (if needed)
      # ControlR_AppOptions__EnableCors: true
      # ControlR_AppOptions__CorsAllowedOrigins__0: https://app.example.com
```

## Next Steps

- **[Reverse Proxy](/docs/admin/reverse-proxy)**: Configure HTTPS with a reverse proxy
- **[Docker Setup](/docs/admin/docker-setup)**: Advanced Docker configuration
- **[Native Installation](/docs/admin/native-installation)**: Deploy without Docker
