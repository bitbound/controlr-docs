---
sidebar_position: 10
title: Troubleshooting
---

## Desktop Client Repair

If the ControlR desktop client misbehaves or you suspect its installed files are corrupt, the agent's installer can repair it.

The installer has a `repair-desktop` command. It fetches the current bundle metadata from the server, downloads that bundle, verifies it, and re-installs the desktop client payload. It does not change the agent service. The agent runs this same command automatically when its desktop-client health checks fail (see Self-Healing below), so you can also run it by hand.

### Repair Command

Run the installer on the machine that has the agent. Use an elevated prompt on Windows, and `sudo` on Linux and macOS.

```bash
sudo ./ControlR.Agent.Installer repair-desktop [--instance-id <instance-id>]
```

The installer binary is named `ControlR.Agent.Installer` (and `ControlR.Agent.Installer.exe` on Windows). Replace `<instance-id>` with your instance id only for a multi-instance install. Omit it for the default instance.

## Agent Self-Update Mechanics

The agent checks for updates once when it starts, then every six hours. Set `DisableAutoUpdate` in the agent's developer options to stop the timer.

### Update Process

1. **Check**: The agent calls `GET /api/agent/updates/get-bundle-metadata/{runtime}`. The response carries the brand, the bundle SHA256, the bundle download URL, the installer SHA256, and the installer download URL.
2. **Brand guard**: If the bundle's brand or publisher does not match the agent's, the check aborts. A mismatched server will not overwrite the install.
3. **Compare**: The agent reads the bundle hash recorded on disk and compares it to the bundle SHA256 from the server. A match means the agent is current and nothing happens. This is a hash comparison, not a version-number comparison.
4. **Download the bootstrap installer**: On a mismatch, the agent downloads the platform installer to a temporary directory and verifies the downloaded file against the installer SHA256. A hash mismatch deletes the file and stops.
5. **Run the installer**: The agent launches the installer with `install`, passing the server URI, tenant id, and instance id. The installer then downloads the full bundle, verifies its hash, stops the running services, replaces the binaries, and restarts them. On Linux the installer is started under a `systemd-run` scope so it keeps running after the agent service stops. On macOS it runs as a launchd job. The agent does not stop services or replace binaries itself.

`DotnetExtractDirectoryCleanupHostedService` is not part of this step. It is an agent-hosted service that runs at agent startup and deletes stale .NET single-file extraction directories left behind by earlier runs.

### Update Failure Handling

An update that fails is logged and otherwise left alone. There is no update-specific cooldown, retry timer, or self-heal trigger. The next attempt happens at the next six-hour tick, and one runs again whenever the agent restarts. The whole check has a 15-minute budget.

## Self-Healing the Desktop Client

Desktop-client repair is a separate path from updates, driven by the agent's desktop-client health checks.

Each failing check reports a failure under a key. When one key records 3 failures within a 30-second window, the agent launches desktop-client repair. A repair sets a 10-minute cooldown, during which further repair requests are suppressed, and only one repair runs at a time. A report flagged immediate triggers a repair without waiting for the count.

So the 3-failures, 30-second window, and 10-minute cooldown belong to desktop-client health, not to update failures.

## Agent Not Showing in Dashboard

If an installed agent never appears in the dashboard, clock skew is a common cause.

When an agent registers or sends a signed request over the agent hub, the server compares its own UTC clock with the timestamp the agent signed the request with. `AgentClockSkewTolerance` is the maximum allowed gap. The shipped configuration sets it to one minute (`00:01:00`) in both `appsettings.json` and `docker-compose.yml`. The server-side setting is `AppOptions:AgentClockSkewTolerance`, whose environment variable is `ControlR_AppOptions__AgentClockSkewTolerance`.

The check is against UTC on both ends, not against a timezone. If either the agent machine or the server machine drifts from true time, the gap grows past the tolerance and the agent's signed requests are rejected. Keep both ends synchronized with an NTP source. Most operating systems do this automatically, but it can be disabled.

You can disable the timestamp check by setting `AgentClockSkewTolerance` to `null`. This is not recommended. It removes the replay-attack protection on the agent endpoints.
