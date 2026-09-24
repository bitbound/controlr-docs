---
sidebar_position: 2
title: Installation
---

Install ControlR using Docker Compose.

Prerequisites are listed in the [Getting Started guide](/docs/getting-started).

## Quick Start

### Using Environment Variables

The Compose file requires four values. Each is declared with `${VAR:?error}`, so Compose stops before creating any container when one of them is missing. `ControlR_AppOptions__PublicBaseUrl` must be the HTTPS URL users will use to reach ControlR. Do not use the local port, the container name, or the Aspire dashboard URL.

Put the values in a file named `.env` in the same directory as the Compose file. Do not put them in front of `sudo`. The shipped sudoers policy rebuilds a minimal environment (`env_reset` is on by default), so a variable you set on the `sudo` command line never reaches Compose and the run dies with an interpolation error. Compose reads `.env` itself, which survives the change of user.

```bash
wget https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose.yml

cat > .env <<'EOF'
ControlR_POSTGRES_USER=controlr_admin
# Replace both values below with unique random strings.
ControlR_POSTGRES_PASSWORD=replace-with-a-strong-random-password
ControlR_ASPIRE_BROWSER_TOKEN=replace-with-a-strong-random-token
ControlR_AppOptions__PublicBaseUrl=https://controlr.example.com
EOF
chmod 600 .env

sudo docker compose up -d
```

The two `replace-with-...` values are examples, not values you can use as written. Generate replacements with `openssl rand -hex 32`, then put one generated value on each line. Replace `https://controlr.example.com` with the HTTPS address where users will reach your server.

Drop `sudo` if your user is already in the `docker` group.

Three containers come up:

| Container | Image | Ports |
|-----------|-------|-------|
| `controlr` | `bitbound/controlr:latest` | host `5120` mapped to container `8080` |
| `postgres` | `postgres:18` | `5432`, internal network only |
| `aspire` | `mcr.microsoft.com/dotnet/aspire-dashboard:latest` | host `18888` |

`ASPNETCORE_HTTP_PORTS` is `8080` inside the container. To serve a different host port, change the left side of the port mapping in the Compose file. Changing that variable moves the port inside the container and breaks the mapping.

The server applies database migrations at startup. There is nothing to run by hand. Compose does not wait for Postgres to report ready, so on a clean first start the `controlr` container can exit once with a database connection error. Its `restart: unless-stopped` policy starts it again and it comes up. Run `docker compose ps` until `controlr` stays running.

Every published `bitbound/controlr` tag is `linux/amd64`. The release workflow can build the server for ARM, but that is a choice made when a release is run, and the default is `linux-x64`. On an ARM host, use the [native install](/docs/admin/native-installation) if the release you are installing carries an ARM64 server archive. Check the release assets before you commit to either route.

### Using Docker Secrets

For deployments that keep credentials out of environment variables:

```bash
wget -O docker-compose-secrets.yml \
  https://raw.githubusercontent.com/bitbound/ControlR/main/docker-compose/docker-compose-secrets.yml
```

That file sets `ControlR_AppOptions__EnableDockerSecrets` to `true`. The app then loads every file in `/run/secrets` as configuration, using the file name as the key. Keys are matched after the `ControlR_` prefix is stripped from environment variables, so the secret file `POSTGRES_USER` fills the same setting as `ControlR_POSTGRES_USER`, and `Bootstrap__AdminPassword` fills the same setting as `ControlR_Bootstrap__AdminPassword`. The directory is not optional. With the flag on and `/run/secrets` absent, the app throws during configuration and never starts. The public URL is not a secret, so set `ControlR_AppOptions__PublicBaseUrl` in `.env` alongside the Compose file.

The shipped file has a startup bug you need to work around before the first run. It mounts `Bootstrap__AdminPassword`, `Bootstrap__ServerServiceAccountTokenId`, and `Bootstrap__ServerServiceAccountTokenSecret` into the container, while the Compose file leaves `ControlR_Bootstrap__AdminEmail` and `ControlR_Bootstrap__ServerServiceAccountName` commented out. Both bootstrap routines treat a half-configured pair as an error and throw, so the container crashes at startup and restarts in a loop. Remove these three names from the service's `secrets:` list and from the top-level `secrets:` map at the bottom of the file:

- `Bootstrap__AdminPassword`
- `Bootstrap__ServerServiceAccountTokenId`
- `Bootstrap__ServerServiceAccountTokenSecret`

If you do want those accounts created on first startup, keep the mounts and also set `ControlR_Bootstrap__AdminEmail`, plus `ControlR_Bootstrap__ServerServiceAccountName` for the service account. A password without an email, or a token without a name, is a rejected configuration rather than a skipped one.

`AppOptions__SmtpPassword`, `AppOptions__GitHubClientSecret`, and `AppOptions__MicrosoftClientSecret` are declared in the top-level map but not mounted into any service, so they change nothing until you add them to the `controlr` service's `secrets:` list. Their files still have to exist.

The Compose file declares its secret files under `./example-secrets/`, so create the directory and every file the top-level map points at. Compose resolves every declared secret file, whether or not a service mounts it, so a missing file stops the whole stack. Keep the Compose file and `example-secrets/` in the same directory and run the commands from there, because those paths resolve relative to the project directory.

```bash
mkdir -p example-secrets

# One raw value per file. The names you are not using can hold a placeholder.
for name in \
  postgres_user postgres_password postgres_db \
  aspire-dashboard-browser-token \
  data-protection-cert-base64 data-protection-cert-password \
  bootstrap-admin-password bootstrap-admin-pat-secret bootstrap-admin-pat-token-id \
  bootstrap-server-service-account-id bootstrap-server-service-account-token-id \
  bootstrap-server-service-account-token-secret \
  smtp-password github-client-secret microsoft-client-secret
do
  [ -s "example-secrets/$name" ] || printf 'replace-me\n' > "example-secrets/$name"
done

chmod 600 example-secrets/*

sudo docker compose -f docker-compose-secrets.yml up -d
```

The Postgres names are read twice, once by the `postgres` service through `POSTGRES_USER_FILE` and once by the app through the mounted secret, so leaving the three of them at the same placeholder still lines up. The official Postgres image supports `_FILE` for `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `POSTGRES_INITDB_ARGS`, which is what that service relies on. Give those three real values before exposing the server. `data-protection-cert-base64` is only decoded when `ControlR_KeyProtectionOptions__EncryptKeys` is `true`, which the shipped file leaves `false`, so a placeholder there is inert.

The Docker Secrets file still needs `ControlR_AppOptions__PublicBaseUrl` in `.env`. Its other values come from secret files, and none of those values use `${VAR:?error}`.

## First Sign-In

With the shipped defaults, the registration form is available while the server has no users. The account you create first becomes server administrator and administrator of the first tenant. Registration closes as soon as that account exists. Set `ControlR_AppOptions__EnablePublicRegistration` to `true` to keep it open.

The shipped Compose file sets `ControlR_AppOptions__RequireUserEmailConfirmation` to `true`, which differs from the application default of `false`. The first account is confirmed automatically, so you do not need SMTP to sign in the first time. Later accounts created through open registration need working SMTP settings. Do not set `ControlR_AppOptions__DisableEmailSending` to `true` while email confirmation is required. User creation throws in that combination.

## Verify Installation

```bash
curl http://127.0.0.1:5120/health
```

The response body is `Healthy`. The endpoint is anonymous and answers only after startup finishes.

To confirm the running build:

```bash
curl http://127.0.0.1:5120/api/v1/version/server
curl http://127.0.0.1:5120/api/v1/version/agent
```

Both are anonymous. The agent route reports the version of the agent bundle this server serves.

The web interface answers at `http://your-server:5120`. Treat that address as a local check rather than a deployment. ControlR does not support exposing that port to the internet, because the server listens on plain HTTP and has no edge protection of its own. Publish it through a reverse proxy, which gives you HTTPS and passes real client addresses through to the server.

Read [Reverse Proxy](/docs/admin/reverse-proxy) before you connect devices, and name your proxy in the trusted-proxy settings there. Several features depend on forwarded headers being trusted, and a proxy that is not in that list makes every device look like it connects from the proxy address.

## Installing the Agent

The agent is built and shipped for five runtimes: `win-x64`, `win-x86`, `linux-x64`, `osx-arm64`, and `osx-x64`. There is no `linux-arm64` agent. The binaries are self-contained single files, so a device does not need the .NET runtime installed.

Installers are downloaded from your own server. They are baked into the server image under `/downloads/<runtime>/`, and that path is served anonymously.

### One-Click Deploy (Recommended)

The **Deploy** page generates the install command for each runtime.

1. Create an installer key or select an existing one. **Usage-Based** keys expire 24 hours after creation, and they stop working once the allowed number of uses is reached. The expiration time you pick is not used for this type. **Time-Based** keys expire at the time you set. **Persistent** keys do not expire.
2. The secret is shown when the key is created. Save it there if you plan to reuse the key, since the key list does not show it again.
3. Pick the target platform tab. The tabs are **Windows x64**, **Windows x86**, **Mac Apple Silicon**, **Mac Intel**, and **Linux**.
4. Optionally add device tags and a customer.
5. Copy the generated command using the copy icon on the script field and run it on the target device.

The generated command always fills in `-s`, `-t`, and `-ks`. It adds `-ki` when a key is selected, and `-i`, `-d`, `-c`, and `-g` when you set them.

### Manual Installation

The generated scripts are the reference for what a manual install does. These are the same commands with only the required arguments. Everything else is listed under [Installer Arguments](#installer-arguments-reference).

Before you run any of them, get the tenant GUID from the read-only **Your Tenant ID** field on the [Settings](/docs/user-guide/settings) page. The copy icon at the end of that field puts it on your clipboard.

Note that the commands below omit `--installer-key-id` (`-ki`) and `--installer-key-secret` (`-ks`). Under the shipped defaults an agent installed without those two registers nothing, so the software lands and no device appears. Add both when you want the device on the server. See [Device Registration](#device-registration) for the exact rules and [Installer Keys](/docs/user-guide/installer-keys) to create a key.

#### Linux

```bash
sudo rm -f /tmp/ControlR.Agent.Installer
sudo curl -o /tmp/ControlR.Agent.Installer https://your-server.example.com/downloads/linux-x64/ControlR.Agent.Installer
sudo chmod +x /tmp/ControlR.Agent.Installer
sudo /tmp/ControlR.Agent.Installer install \
  -s https://your-server.example.com \
  -t <your-tenant-guid>
```

To uninstall:

```bash
sudo /tmp/ControlR.Agent.Installer uninstall
```

Add `-i <instance-id>` to both commands when you want a second agent on the same machine.

#### macOS

```bash
sudo rm -f /tmp/ControlR.Agent.Installer
sudo curl -o /tmp/ControlR.Agent.Installer https://your-server.example.com/downloads/osx-arm64/ControlR.Agent.Installer
sudo chmod +x /tmp/ControlR.Agent.Installer
sudo /tmp/ControlR.Agent.Installer install \
  -s https://your-server.example.com \
  -t <your-tenant-guid>
```

Use the `osx-x64` path on an Intel Mac. Everything else is identical.

To uninstall:

```bash
sudo /tmp/ControlR.Agent.Installer uninstall
```

#### Windows

Download and run the installer. This is the generated command with the optional arguments removed, and it elevates through a UAC prompt.

```powershell
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest `
  -Uri "https://your-server.example.com/downloads/win-x64/ControlR.Agent.Installer.exe" `
  -OutFile "$env:TEMP\ControlR.Agent.Installer.exe" `
  -UseBasicParsing

Start-Process `
  -FilePath "$env:TEMP\ControlR.Agent.Installer.exe" `
  -ArgumentList "install -s https://your-server.example.com -t <your-tenant-guid>" `
  -Verb RunAs
```

You can also run the executable directly from a PowerShell window opened as administrator. The installer refuses to run unelevated either way.

To uninstall, from an elevated PowerShell:

```powershell
& "$env:TEMP\ControlR.Agent.Installer.exe" uninstall
```

Use the `win-x86` path on a 32-bit device.

#### Repair Desktop Client

`repair-desktop` replaces only the desktop client payload from the current bundle. It leaves the agent service alone. It needs elevation, and it reads the server URI, tenant, and device ID that the original install saved on the device.

```bash
sudo /tmp/ControlR.Agent.Installer repair-desktop
```

### What The Installer Does

The installer is a bootstrap. It asks your server for the current bundle metadata, verifies the brand and publisher match its own, downloads the bundle, and checks its SHA-256 hash before it writes anything.

**Linux.** Extracts the bundle to `/usr/local/bin/ControlR/<instance-id>`. The instance ID defaults to `default`, so a plain install lands in `/usr/local/bin/ControlR/default`. Writes a system unit at `/etc/systemd/system/controlr.agent.service` and a user unit at `/etc/systemd/user/controlr.desktop.service`, then enables and starts the agent, enables the desktop unit globally, and starts the desktop client for users already logged in. The desktop client runs as the console user, not as root. Pass `-i` and both unit names gain the instance ID, for example `controlr.agent-myserver.service`.

**macOS.** Extracts the app bundle to `/Applications/ControlR.app` and the agent to `/Library/Application Support/ControlR/<instance-id>`. Writes three launchd jobs: a LaunchDaemon for the agent at `/Library/LaunchDaemons/app.controlr.agent.plist`, a LaunchAgent for the desktop client at `/Library/LaunchAgents/app.controlr.desktop.plist`, and a LaunchDaemon the updater uses to run installer commands at `/Library/LaunchDaemons/app.controlr.agent.installer.plist`. The desktop client is an agent, not a daemon, because it has to run inside the user's GUI session. An instance ID is inserted as one more dot-separated component in each of these names, and in the bundle name too. With `-i myserver` you get `/Applications/ControlR.myserver.app` and `/Library/LaunchDaemons/app.controlr.agent.myserver.plist`.

**Windows.** Installs to `C:\Program Files\ControlR\<instance-id>`, creates the agent as an auto-start Windows service with `sc.exe`, and starts it.

### Device Registration

The installer creates the device on the server only when you pass **both** `--installer-key-id` and `--installer-key-secret`. Passing the secret alone installs the software and registers nothing. The key ID selects the key, and the secret proves you hold it.

Without a key, registration happens later on its own only when `AllowAgentsToSelfBootstrap` is `true` and the server has exactly one tenant. The agent asks for that at connection time. A multi-tenant server rejects it, so use installer keys there.

### Installer Arguments Reference

The option names are the same on every platform, and they are lowercase kebab-case.

| Argument | Required | Description |
|----------|----------|-------------|
| `--server-uri` (`-s`) | Yes | Absolute URL of the ControlR server, including the scheme |
| `--tenant-id` (`-t`) | Yes | GUID of the tenant that owns the device |
| `--installer-key-id` (`-ki`) | No | GUID of the installer key. Registration needs this and `-ks` |
| `--installer-key-secret` (`-ks`) | No | Secret of that installer key |
| `--instance-id` (`-i`) | No | Separates multiple agent installs on one machine. Affects paths, unit names, and log folders |
| `--device-id` (`-d`) | No | GUID of an existing device to reuse. Otherwise the installer reuses the saved ID or generates one |
| `--device-tags` (`-g`) | No | Comma-separated tag GUIDs |
| `--customer` (`-c`) | No | GUID of the customer to assign the device to |

`uninstall` and `repair-desktop` accept only `--instance-id`.

Malformed values in `--device-tags` are dropped without a warning. A tag name typed where a GUID belongs is ignored, and the device installs untagged.

## Configuration

ControlR is configured through environment variables prefixed with `ControlR_`. See [Configuration](/docs/configuration) for the full list.

Defaults that matter at install time:

- `ControlR_AppOptions__EnablePublicRegistration`: keep registration open after the first account. Default `false`.
- `ControlR_AppOptions__DisableFirstUserSelfRegistration`: close the one-time first-account signup. Default `false`.
- `ControlR_DeveloperOptions__AllowAgentsToSelfBootstrap`: lets agents register without a key on a single-tenant server. Development and load testing only. Default `false`.
- `ControlR_AppOptions__RequireUserEmailConfirmation`: application default `false`, shipped Compose value `true`.
- `ControlR_AppOptions__MaxFileTransferSize`: cap in bytes for the remote file manager. Shipped value `104857600`. Use a negative number for unlimited, never `0`. The configuration page explains why zero is a trap.

## Next Steps

- **[Agent OS Support](/docs/agent-os-support)**: What each operating system supports, and which architectures are built
- **[Configuration](/docs/configuration)**: Available settings
- **[Reverse Proxy](/docs/admin/reverse-proxy)**: Set up HTTPS with a reverse proxy
- **[Upgrading](/docs/admin/upgrading)**: How to upgrade when new versions are released
