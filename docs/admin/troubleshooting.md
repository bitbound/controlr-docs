---
sidebar_position: 10
title: Troubleshooting
---

## Desktop Client Repair

If the ControlR desktop client is not behaving correctly, or if you suspect local files have been corrupted, you can use the agent's installer to repair the installation.

The installer includes a `repair-desktop` command that re-installs the desktop client from the current agent bundle. This command is intended for internal troubleshooting and is not part of the standard installation workflow.

### Repair Command

Run the following command on the machine where the agent is installed:

```bash
sudo ./ControlR.Agent.Installer repair-desktop [--instance-id <instance-id>]
```

Replace `<instance-id>` with your specific instance identifier if you are running a multi-instance setup.

## Agent Self-Update Mechanics

Agents automatically check for updates at a fixed interval (every 6 hours).

### Update Process

1. **Check**: The agent contacts the server via the `get-bundle-metadata` endpoint to check for a new version.
2. **Verify**: The agent verifies the SHA256 hash of the new bundle to ensure integrity.
3. **Download**: The new bundle is downloaded to a temporary location.
4. **Install**: The agent initiates the update process, which includes:
   - Stopping the current agent and desktop client services.
   - Replacing the binaries with the new version.
   - Performing any necessary cleanup (e.g., removing old installation files via `DotnetExtractDirectoryCleanupHostedService`).
5. **Restart**: The agent and desktop client services are restarted.

### Failure Handling

If an update fails, the agent will enter a cooldown period and retry after 10 minutes. After 3 consecutive failures within a 30-second window, the agent will trigger an automatic self-healing procedure (the Desktop Client Repair System) to attempt to recover the installation.

## Agent Not Showing in Dashboard

If you've installed the agent but it's not appearing in the ControlR dashboard, it might be due to clock skew.

The `AgentClockSkewTolerance` value (which defaults to 1 minute in both the `docker-compose.yml` and `AppSettings` files) ensures that the agent and server clocks are synchronized (not with each other, but with "actual time" for their timezone). Both the agent and the server must be synced with a Network Time Protocol (NTP) server. While most operating systems have this feature built-in, it can occasionally be disabled.

If the system clocks are inaccurate, the agent authentication mechanism will fail. You can bypass these time-based checks by setting `AgentClockSkewTolerance` to `null`, but this is not recommended as it makes the agent endpoints vulnerable to replay attacks.
