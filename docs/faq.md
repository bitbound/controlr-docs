---
sidebar_position: 7
title: FAQ
---

## Frequently Asked Questions

### Is ControlR free to use?

Yes. ControlR is MIT licensed.

### Can I use ControlR without Docker?

Docker is the recommended and easiest deployment method. However, native installation is also supported. The server is published as a ZIP archive with each release and can be deployed directly on Linux using systemd. See the [Native Installation](/docs/admin/native-installation) guide for details.

### What platforms are supported for clients?

ControlR clients can run on Windows, macOS, and Linux (X11 and Wayland). The web interface works in any modern browser.

### How many devices can ControlR handle?

The number of devices per instance depends on the server's available resources.

### Is data encrypted in transit?

Yes. All communications between clients and the server are encrypted using TLS/SSL.

## Do I need to open any ports for the agent?

No. All agent communications are initiated from the agent to the server over an outbound SignalR connection (WebSocket by default) and outbound HTTP requests. No inbound ports need to be opened on the agent's network.

### How do I upgrade ControlR?

See the [Upgrading guide](/docs/admin/upgrading) for step-by-step instructions.

### The agent or desktop client isn't starting or crashes instantly. What should I check?

1. Check ControlR logs for any errors. See [Remote Logs](/docs/user-guide/device-access/remote-logs) for log file locations.
2. Check **Event Viewer → Windows Logs → Application** for any .NET runtime errors related to ControlR.
3. Check **Event Viewer → Applications and Services → Microsoft → Windows → CodeIntegrity → Operational** for any code integrity violations that may be preventing the agent or desktop client from starting.
4. Check **Event Viewer → Applications and Services → Microsoft → Windows → AppLocker → EXE and DLL** for any AppLocker blocks that may be preventing the agent or desktop client from starting.
