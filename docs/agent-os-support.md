---
sidebar_position: 3
title: Agent OS Support
---

## Overview

The ControlR agent runs as a background service on target devices. It holds the connection to the server and runs the terminal, file manager, log reader, and TCP proxy.

Remote control is not one of them. The agent contains no capture or input code. It authenticates the session, then hands it to a **Desktop Client** process running in a graphical user session over a local IPC channel. That client captures the screen and injects input. So remote control, desktop preview, and chat need a running desktop client in a GUI session on every operating system. Terminal, file system, log streaming, and the VNC relay go through the agent and work without one.

## What Is Built

Release CI publishes the agent, the desktop client, and the installer for exactly five runtimes.

| Runtime | Platform | Built | Exercised by CI |
|---------|----------|-------|-----------------|
| `win-x64` | Windows 11 | Yes | Yes |
| `win-x86` | Windows 11 | Yes | No |
| `linux-x64` | Linux, glibc | Yes | Yes |
| `osx-arm64` | macOS, Apple Silicon | Yes | Yes |
| `osx-x64` | macOS, Intel | Yes | No |

The binaries are self-contained and published as a single file. A device does not need the .NET runtime installed.

**There is no `linux-arm64` agent.** The runtime list in the code has no ARM Linux entry, and an agent that resolves its own runtime to anything outside those five throws `PlatformNotSupportedException`. Installing an agent on an ARM Linux device is not supported.

The server is a separate question, and it is also AMD64 today. Every `bitbound/controlr` tag on Docker Hub is `linux/amd64`. The release workflow can build the server for `linux-arm64`, but that is a choice made when a release is run, and the default is `linux-x64`. Check which archives a given release actually carries before planning an ARM host around one.

There is no musl or Alpine build. The Linux binaries are for glibc AMD64.

Declared version floors, from the build settings:

- **Windows.** The Windows target framework is `net10.0-windows8.0`, so the compiled floor is Windows 8.0. Nothing in the code checks for a newer version. The project documents and tests Windows 11.
- **macOS.** `SupportedOSPlatformVersion` and the app bundle's `LSMinimumSystemVersion` are both `12.0`. The build targets the macOS 26.5 SDK.
- **Linux.** "Latest LTS" is the tested range. No version is pinned in code.

## Windows 11 (x64, x86)

| Capability | Support | Notes |
|---|---|---|
| Remote Control | Full | DXGI desktop duplication, with GDI BitBlt as fallback |
| Terminal | Yes | Embedded PowerShell host |
| Chat | Yes | Needs the desktop client in the target session |
| File System | Yes | |
| Log Streaming | Yes | |
| Auto-Update | Yes | Background 6h check |

Windows also carries features that have no equivalent elsewhere. The display privacy screen throws `PlatformNotSupportedException` on macOS and on both Linux paths. The agent refuses a `Ctrl`+`Alt`+`Del` request from any platform other than Windows. The web console only offers the block-user-input control when the device reports Windows.

Capture uses desktop duplication when the viewer's **Enable DirectX** preference is on, which is the default. It falls back to GDI BitBlt when DirectX reports nothing new but a frame is due, or when the preference is off. Aero Peek is switched off when a remote-control session starts on the device and switched back on when that session stops.

## macOS

### Apple Silicon

Tested on Mac Mini M4 and MacBook Air M1.

| Feature | Support |
|---------|---------|
| **Remote Control** | Full support |
| **Login Window** | Controlling the login window is only possible after a user has logged in |
| **VNC (Apple Screen Sharing)** | Experimental |
| **Code Signing** | Developer ID, hardened runtime, notarized |

The login-window limitation is not a permissions prompt. The agent runs as a LaunchDaemon in the system domain and keeps working, but it lists sessions by asking `who -u` and keeps only users with a UID at or above 500. A machine sitting at the login window has no such user, so there is no session to select and no desktop client to launch into. The agent bootstraps the desktop client into a signed-in user's GUI domain, which does not exist beforehand.

### Intel (untested)

The agent should run on Intel macOS, but no CI job runs it. Test jobs build and run on Apple Silicon only. Treat Intel macOS as "should work, not validated."

| Feature | Support |
|---|---|
| Remote Control | Untested |
| VNC (Apple Screen Sharing) | Experimental |
| Code Signing | Developer ID, hardened runtime, notarized |

Intel builds are not second-class at the signing step. The Apple build job runs one matrix entry per architecture, and both entries sign the app bundle, the embedded agent, its bundled native libraries, and the installer binary with a Developer ID identity under a hardened runtime with a secure timestamp. Notarization and stapling then run for both, gated by a release input that is on by default. The target runtime is the only per-architecture difference in that job.

## Linux AMD64 (latest LTS)

### X11

| Feature | Support |
|---------|---------|
| **Remote Control** | Full support |

Tested on Fedora KDE, Ubuntu, Kubuntu, and Mint.

**Ubuntu login screen:** You must enable X11 for the login screen. Edit `/etc/gdm3/custom.conf` and uncomment the line `WaylandEnable=false`, then reboot.

This is not only a preference. The agent detects a display-manager session, reads the greeter's Xauthority, and launches a desktop client against it. When it finds a Wayland display owned by a display manager, it logs that the greeter session is unsupported and launches nothing. On a Wayland-only Ubuntu the login screen is simply unreachable.

### Wayland

| Feature | Support |
|---------|---------|
| **Remote Control** | Supported via XDG Desktop Portal |

Capture on Wayland goes through the XDG Desktop Portal ScreenCast interface and PipeWire. It needs the GStreamer 1.0 libraries at run time, loaded from the system.

Tested on Ubuntu, Kubuntu, and Fedora KDE. The required packages are preinstalled on these distributions. For manual installation:

```bash
sudo apt install libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good
```

These are the Debian and Ubuntu package names, and they are the ones the agent prints when loading GStreamer fails. On an RPM distribution install the GStreamer 1.0 equivalent packages.

X11 is required for the login/greeter screen.

The desktop client picks its backend from the environment, in this order. `WAYLAND_DISPLAY` being set selects Wayland. Otherwise `DISPLAY` being set selects X11, unless `XDG_SESSION_TYPE` is `wayland`, which means XWayland and selects Wayland instead. Otherwise `XDG_SESSION_TYPE` on its own selects the matching backend. If nothing matches, the environment type is unknown and the client fails to start with an unsupported desktop environment error.

### VNC

| Feature | Support |
|---------|---------|
| **VNC** | Experimental |

The relay proxies a TCP connection on the device's own loopback address into a WebSocket the browser can reach. Nothing about it is macOS- or Linux-specific in code, and there is no operating system check on the request path. A Windows device running a loopback VNC server would work, and the interface does not label it experimental either. The label here reflects how much the project has tested it.

## All Operating Systems

| Feature | Support |
|---------|---------|
| **Terminal** | Embedded cross-platform PowerShell host |
| **File System** | Yes |
| **Log Streaming** | Yes |
| **Auto-Update** | 6-hour check, install applied through the installer |

The terminal is PowerShell 7 hosted inside the agent process through the PowerShell SDK. It is not `bash`, `zsh`, or `sh`, and it is not launched as an external `pwsh`. Nothing needs to be installed on the device for it to work. On Windows each session also runs `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` before it starts.

Auto-update checks every six hours. There is no retry or backoff after a failed check, so a failed check waits for the next tick. Applying an update is not an in-place binary swap. The agent downloads the bootstrap installer and launches it, via `systemd-run --scope` on Linux and a one-shot LaunchDaemon on macOS. A `DisableAutoUpdate` flag in the agent's developer settings section turns the check off. It is set to `true` only in the agent's `appsettings.Development.json`, and an update check forced from the server bypasses it.
