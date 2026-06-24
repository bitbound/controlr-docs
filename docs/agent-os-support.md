---
sidebar_position: 3
title: Agent OS Support
---

## Overview

The ControlR agent runs as a background service on target devices. The level of remote control support varies by operating system and display server.

## Windows 11 (x64, x86)

| Feature | Support |
|---------|---------|
| **Remote Control** | Full support |

## macOS

### Apple Silicon

Tested on Mac Mini M4 and MacBook Air M1 running latest version of macOS.

| Feature | Support |
|---------|---------|
| **Remote Control** | Full support |
| **Login Window** | Controlling the login window is only possible after a user has logged in |
| **VNC (Apple Screen Sharing)** | Experimental |

### Intel (untested)

| Feature | Support |
|---------|---------|
| **Remote Control** | Not supported |
| **VNC (Apple Screen Sharing)** | Experimental |
| **Code Signing** | Signed using adhoc certificate |

## Linux AMD64 (latest LTS)

### X11

| Feature | Support |
|---------|---------|
| **Remote Control** | Full support |

Tested on Fedora KDE, Ubuntu, Kubuntu, and Mint.

**Ubuntu login screen:** You must enable X11 for the login screen. Edit `/etc/gdm3/custom.conf` and uncomment the line `WaylandEnable=false`, then reboot.

### Wayland

| Feature | Support |
|---------|---------|
| **Remote Control** | Experimental via XDG Desktop Portal |

Tested on Ubuntu, Kubuntu, and Fedora KDE. The required packages are preinstalled on these distributions. For manual installation:

```bash
sudo apt install libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good
```

X11 is required for the login/greeter screen.

### VNC

| Feature | Support |
|---------|---------|
| **VNC** | Experimental |

## All Operating Systems

| Feature | Support |
|---------|---------|
| **Terminal** | Uses embedded cross-platform PowerShell host |
