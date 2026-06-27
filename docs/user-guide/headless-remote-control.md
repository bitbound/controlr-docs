---
sidebar_position: 11
title: Headless Remote Control
---

## Overview

ControlR can remotely control machines that have no physical monitor attached, commonly referred to as **headless** systems. These include workstations tucked away in a closet, dedicated kiosks, VM hosts, or any customer device that normally runs without a display.

However, when no monitor is connected, the operating system may not initialize a display output, which can prevent remote control sessions from capturing the screen. To work around this, you need to provide a **virtual display adapter** so the OS always has an active screen to render.

> **Note:** Headless remote control has only been validated on **Windows**. Headless setups on macOS and Linux have **not yet been evaluated** and may not work as expected.

## Why a Virtual Display Is Needed

When the OS detects no physical monitor:

- The GPU may be powered down or put into a low-power state
- Screen capture APIs (GDI, DirectX, etc.) may return a blank or black frame
- Resolution and refresh rate may default to unusable values

A virtual display driver or headless HDMI dongle tricks the system into thinking a monitor is always connected, keeping the GPU active and the screen capture pipeline functional.

## Options for Virtual Display

### 1. Virtual-Display-Driver (Recommended, Windows)

The [Virtual-Display-Driver](https://github.com/VirtualDrivers/Virtual-Display-Driver) is an open-source, open-frame display driver for Windows (x64). It creates a virtual monitor that Windows treats as a real display.

**Key features:**
- Free and open source (MIT license)
- Supports up to four virtual monitors
- Customizable resolutions (up to 8K)
- Works with headless systems, no physical GPU needed
- Signed driver available for easy installation

**Installation steps:**
1. Download the latest `VirtualDisplayDriver.msi` from the [releases page](https://github.com/VirtualDrivers/Virtual-Display-Driver/releases)
2. Run the MSI and follow the installer prompts
3. Reboot the machine
4. After reboot, Windows will detect a new display that you can configure in **Settings > Display**

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

When using multiple virtual displays (e.g., with Virtual-Display-Driver's four-monitor support), all monitors belong to the Console session. You can switch between them during the remote control session.