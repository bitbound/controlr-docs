---
sidebar_position: 3
title: Headless Remote Control
---

## Overview

ControlR can remote-control machines without a physical monitor attached (headless systems): workstations in a closet, dedicated kiosks, VM hosts, and customer devices without a display.

Without a connected monitor, the OS may leave the GPU uninitialized and the capture pipeline returns a blank frame. A **virtual display adapter** keeps the OS reporting an active screen, so capture frames come through.

> **Note:** Headless remote control has only been validated on Windows. macOS and Linux headless setups have not been evaluated.

## Why a Virtual Display Is Needed

When the OS detects no physical monitor:

- The GPU may be powered down or put into a low-power state
- Screen capture APIs (GDI, DirectX, etc.) may return a blank or black frame
- Resolution and refresh rate may default to unusable values

A virtual display driver or headless HDMI dongle tricks the system into thinking a monitor is always connected, keeping the GPU active and the screen capture pipeline functional.

## Options for Virtual Display

### 1. Virtual-Display-Driver (Recommended, Windows)

The [Virtual-Display-Driver](https://github.com/VirtualDrivers/Virtual-Display-Driver) is an open-source display driver for Windows. It creates virtual monitors that Windows treats as real displays.

**Key features:**
- Free and open source (MIT license)
- Monitor count, resolutions, and refresh rates are configured in the driver's own settings, so it is not limited to a fixed list
- Custom EDIDs, so a virtual monitor can emulate a display you already have
- Works on headless systems

**Installation steps:**

Install with winget, which is the shortest path:

```powershell
winget install --id=VirtualDrivers.Virtual-Display-Driver -e
```

Or download the `VDD.Control` archive from the [releases page](https://github.com/VirtualDrivers/Virtual-Display-Driver/releases), extract it, run Virtual Driver Control, and choose **Install**. The releases page also carries driver-only archives if you would rather not install the control app.

Two things the project calls out about living with the driver. It needs the Microsoft Visual C++ Redistributable on the machine, and the usual symptom of a missing one is an error about `vcruntime140.dll`. Before you apply a major GPU or chipset driver update, uninstall the virtual display driver first. If the machine comes back with a black screen or the display priority looks scrambled, boot into Safe Mode and uninstall it there.

After the driver is installed, Windows exposes a new display that you can configure in **Settings > Display**.

### 2. Headless HDMI / DisplayPort Dongle

A physical **HDMI or DisplayPort dummy plug** can be plugged into any GPU output port. These are inexpensive, plug-and-play, and require no software installation.

**Pros:**
- Truly plug-and-play, no drivers to install
- Works with any GPU that has an HDMI or DisplayPort output
- Typically supports 1080p or 4K resolutions

**Cons:**
- Occupies a physical port on the GPU (may not be an option on mini PCs or slim business desktops)
- Requires onsite or hands-on access to install
- Less flexible than a software-based solution

## Verifying Remote Control Works

After installing a virtual display adapter:

1. **Check the display is detected:** Open **Settings > System > Display** and confirm a second monitor (or the virtual monitor) appears
2. **Connect a remote control session:** Open the ControlR web UI, navigate to the device, and start a Remote Control session
3. **Verify screen capture:** The remote stream should show the virtual desktop at the expected resolution

If the screen still appears blank, try adjusting the resolution to a standard value (e.g., 1920×1080) and ensure the virtual monitor is set as an **extended** display (not duplicated).

## Multiple Monitors

When using multiple virtual displays, all monitors belong to the Console session. You can switch between them during the remote control session.