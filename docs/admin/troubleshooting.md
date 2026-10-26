---
sidebar_position: 10
title: Troubleshooting
---

## Troubleshoot the Agent

### Raise the Agent's Log Level

The agent writes its logs through Serilog, and the minimum level comes from the `Serilog:MinimumLevel` section of its configuration. The `Logging:LogLevel` keys that drive the server's logging do nothing on the agent, because Serilog replaces the built-in logging stack in that component.

Set the level one of two ways.

The first is the `Serilog__MinimumLevel__Default` environment variable on the agent service process.

| Platform | How to set it |
|----------|---------------|
| Linux | `sudo systemctl edit controlr.agent.service`, add `[Service]` and `Environment="Serilog__MinimumLevel__Default=Debug"`, then `sudo systemctl restart controlr.agent.service`. For a multi-instance install the unit is `controlr.agent-{instance-id}.service` |
| macOS | Add an `EnvironmentVariables` dictionary carrying `Serilog__MinimumLevel__Default` set to `Debug` in `/Library/LaunchDaemons/app.controlr.agent.plist`, then `sudo launchctl kickstart -k system/app.controlr.agent`. Multi-instance plists and labels carry the instance id |
| Windows | Add `Serilog__MinimumLevel__Default=Debug` to the `Environment` multi-string value under `HKLM\SYSTEM\CurrentControlSet\Services\ControlR.Agent`, then restart the service. A multi-instance service is named `ControlR.Agent ({instance-id})`. This is the same mechanism the agent installer uses to set the service environment |

The second is the `appsettings.json` file in the agent's settings directory. The file is optional; create it if it is missing. The `{instance-id}` segment defaults to `default`.

| Platform | Settings file |
|----------|---------------|
| Windows | `C:\ProgramData\ControlR\{instance-id}\appsettings.json` |
| Linux and macOS, elevated install | `/etc/controlr/{instance-id}/appsettings.json` |
| Linux and macOS, per-user install | `~/.controlr/{instance-id}/appsettings.json` |

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug"
    }
  }
}
```

Restart the agent service after either change. The settings file is watched, but the logger is built once when the process starts, so a level change does not take effect until the service restarts.

`Debug` is far noisier than the shipped `Information`. Set the value back and restart again when you are done.

### Read Agent Logs from the Server

[Remote Logs](/docs/user-guide/device-access/remote-logs) streams the agent's, installer's, and desktop client's log files off the device without touching it. It needs the `device.logs.read` permission. The files roll daily and the device deletes them after about 7 days, and that page carries the per-platform log paths.

### Find Crashes the App Logs Miss

A process that dies hard often leaves nothing in its own log file, because the crash beats the logger. The operating system keeps the other half of the record.

| Platform | Where to look |
|----------|---------------|
| Windows | Event Viewer under **Windows Logs > Application** and **System**. Look for `.NET Runtime` and `Application Error` entries naming `ControlR.Agent`. Crash dumps land wherever Windows Error Reporting is configured to put them |
| Linux | `journalctl -u controlr.agent.service -n 200` shows service exits and the signal systemd observed. `dmesg` shows OOM-killer deaths |
| macOS | Console.app or `log show --last 1h` filtered on the agent process. `launchd` reports the daemon's exit status |

### Agent Not Showing in Dashboard

If an installed agent never appears in the dashboard, clock skew is a common cause.

When an agent registers or sends a signed request over the agent hub, the server compares its own UTC clock with the timestamp the agent signed the request with. `AgentClockSkewTolerance` is the maximum allowed gap. The shipped configuration sets it to one minute (`00:01:00`) in both `appsettings.json` and `docker-compose.yml`. The server-side setting is `AppOptions:AgentClockSkewTolerance`, whose environment variable is `ControlR_AppOptions__AgentClockSkewTolerance`.

The check is against UTC on both ends, not against a timezone. If either the agent machine or the server machine drifts from true time, the gap grows past the tolerance and the agent's signed requests are rejected. Keep both ends synchronized with an NTP source. Most operating systems do this automatically, but it can be disabled.

You can disable the timestamp check by setting `AgentClockSkewTolerance` to `null`. This is not recommended. It removes the replay-attack protection on the agent endpoints.

When the clock is right, check the installer key. The server logs the reason a registration is rejected, and the exact strings to search for are in [Agent Registration Rejections](#agent-registration-rejections).

### Desktop Client Repair

If the ControlR desktop client misbehaves or you suspect its installed files are corrupt, the agent's installer can repair it.

The installer has a `repair-desktop` command. It fetches the current bundle metadata from the server, downloads that bundle, verifies it, and re-installs the desktop client payload. It does not change the agent service. The agent runs this same command automatically when its desktop-client health checks fail (see Self-Healing below), so you can also run it by hand.

#### Repair Command

Run the installer on the machine that has the agent. Use an elevated prompt on Windows, and `sudo` on Linux and macOS.

```bash
sudo ./ControlR.Agent.Installer repair-desktop [--instance-id <instance-id>]
```

The installer binary is named `ControlR.Agent.Installer` (and `ControlR.Agent.Installer.exe` on Windows). Replace `<instance-id>` with your instance id only for a multi-instance install. Omit it for the default instance.

### Agent Self-Update Mechanics

The agent checks for updates once when it starts, then every six hours.

#### Turning Auto-Update Off

Turn the check off before replacing the agent binary with a test build, so the next tick does not put the released bundle back. The flag is `DisableAutoUpdate` in the agent's `Developer` configuration section, and there are two ways to set it.

- The settings-directory `appsettings.json` from [Raise the Agent's Log Level](#raise-the-agents-log-level), adding a `Developer` section. This file is watched and the flag is read at check time, so the change applies without a restart.

  ```json
  {
    "Developer": {
      "DisableAutoUpdate": true
    }
  }
  ```

- The environment variable `Developer__DisableAutoUpdate=true` on the agent service process, set the same way as `Serilog__MinimumLevel__Default` above. A process restart picks it up. If the settings file also sets the flag, the file wins, because it loads after the environment.

An update check forced from the server bypasses the flag and updates the device anyway.

#### Update Process

1. **Check**: The agent calls `GET /api/agent/updates/get-bundle-metadata/{runtime}`. The response carries the brand, the bundle SHA256, the bundle download URL, the installer SHA256, and the installer download URL.
2. **Brand and instance check**: If the bundle's brand key addresses a different install, or the instance id differs, the agent treats it as a migration and runs the installer, which moves the install onto the brand and instance id the server names. Publisher is carried in the metadata but is not compared.
3. **Compare**: The agent reads the bundle hash recorded on disk and compares it to the bundle SHA256 from the server. A match means the agent is current and nothing happens. This is a hash comparison, not a version-number comparison.
4. **Download the bootstrap installer**: On a mismatch, the agent downloads the platform installer to a temporary directory and verifies the downloaded file against the installer SHA256. A hash mismatch deletes the file and stops.
5. **Run the installer**: The agent launches the installer with `install`, passing the server URI, tenant id, and instance id. The installer then downloads the full bundle, verifies its hash, stops the running services, replaces the binaries, and restarts them. On Linux the installer is started under a `systemd-run` scope so it keeps running after the agent service stops. On macOS it runs as a launchd job. The agent does not stop services or replace binaries itself.

Separately, at agent startup the agent deletes stale .NET single-file extraction directories left behind by earlier runs.

#### Update Failure Handling

An update that fails is logged and otherwise left alone. There is no update-specific cooldown, retry timer, or self-heal trigger. The next attempt happens at the next six-hour tick, and one runs again whenever the agent restarts. The whole check has a 15-minute budget.

### Self-Healing the Desktop Client

Desktop-client repair is a separate path from updates, driven by the agent's desktop-client health checks.

Each failing check reports a failure under a key. When one key records 3 failures within a 30-second window, the agent launches desktop-client repair. A repair sets a 10-minute cooldown, during which further repair requests are suppressed, and only one repair runs at a time. A report flagged immediate triggers a repair without waiting for the count.

So the 3-failures, 30-second window, and 10-minute cooldown belong to desktop-client health, not to update failures.

## Troubleshoot the Server

### Where the Server Logs Are

The server writes to standard output, so the log location depends on how it runs.

| Deployment | Command |
|------------|---------|
| Docker Compose | `docker logs controlr` |
| Native Linux install | `journalctl -u controlr -n 200 --no-pager` |

Raise the level with the same `Logging:LogLevel` keys the shipped configuration uses. The environment variable for the overall floor is `ControlR_Logging__LogLevel__Default`, and the full key table is in [Configuration](/docs/configuration). The per-category `Microsoft.AspNetCore.HttpOverrides` key is the one to raise when the server mistrusts a reverse proxy's forwarded headers. Restart the container or the `controlr` service after a change.

### First Start Exits Once

On a clean first start the `controlr` container can exit once with a database connection error, because Compose does not wait for Postgres to report ready. The restart policy starts it again and it comes up. This is expected on the very first run. See [Installation](/docs/installation).

### Restart Loop When the Database Is Unreachable

A server that cannot reach its database at startup exits instead of starting degraded, and systemd restarts it every 10 seconds per `RestartSec`. It recovers on its own once the database answers. `journalctl -u controlr -n 50 --no-pager` shows the underlying exception. See [Native Installation](/docs/admin/native-installation) for the upgrade-window case.

### Agent Registration Rejections

When an agent never appears in the dashboard and the clock is synchronized, the installer key is the usual cause, and the server logs why. Search the server logs for these strings:

- `Invalid installer key.`
- `Invalid key secret`
- `Key has expired or is otherwise invalid`

A match names the rejected credential path. Re-issue a key and reinstall the agent. The agent-side view of the same failure is [Agent Not Showing in Dashboard](#agent-not-showing-in-dashboard).
