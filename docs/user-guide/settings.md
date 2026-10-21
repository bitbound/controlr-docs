---
sidebar_position: 9
title: User Settings
---

## Overview

The Settings page (`/settings`) holds your per-user preferences. The sidebar entry is **Settings**.

There is no save button. Each control writes its value to your account the moment you change it, and a confirmation message appears. The only button on the page is **Restore Defaults**, inside **Default Quality Settings**.

Values are stored server-side as named user preferences, so they follow your account to any browser or machine. The page groups them in this order: **Tenant ID**, **User ID**, **User Display Name**, **Show Notification to User**, **Theme**, **Default Keyboard Input Mode**, **Default View Mode**, **Default Capture Settings**, **Default Encoding Settings**, **Default Quality Settings**.

The remote-control sections are defaults for new sessions. A running session reads them at start, and that session's own toolbar can override them without changing your stored preference.

## Tenant ID

A read-only field labeled **Your Tenant ID**. The icon at the end of the field copies the value to the clipboard.

## User ID

A read-only field labeled **Your User ID**, with the same copy icon.

## User Display Name

A text field labeled **Shown to partners when connecting**. Enter up to 25 characters. Letters, numbers, spaces, underscores, and hyphens are allowed. Anything else is rejected when you edit the field.

## Show Notification to User

One checkbox: **Notify users when a remote control session starts**. It is on by default. The stored preference name is `notify-user-on-session-start`.

The tenant can override this preference. When your tenant has its own value for `notify-user-on-session-start`, that value wins regardless of what you choose, the checkbox is disabled, and an info bar reads `This setting is being enforced by your tenant administrator.`

## Theme

A radio group with two options.

| Option | Description |
|---|---|
| **Dark** | Dark theme. This is the default. |
| **Light** | Light theme. |

The stored preference is `theme-mode`. The header bar carries a second control for the same preference, so changing the theme there changes it here too.

The stored value also accepts `Auto`, which makes the interface follow the operating system's dark-mode setting. No control on this page or in the header writes `Auto`. You can set it through the user preferences API.

Unauthenticated visitors do not have a theme preference. They get the theme the server is configured to serve.

## Default Keyboard Input Mode

Controls how keyboard input is sent during remote control sessions.

| Mode | Description |
|------|-------------|
| **Auto** | Types the logical character for text input, while keeping physical-style handling for commands, navigation keys, and modifiers. This is the default. |
| **Physical** | Simulates the same physical key position on the remote machine, regardless of keyboard layout. |
| **Virtual** | Prefers the logical key or character value, so pressing a key types that same character regardless of the remote layout. |

## Default View Mode

| Mode | Description |
|------|-------------|
| **Fit** | Fits the remote screen to the browser window. This is the default. |
| **Stretch** | Fills the browser window, which can distort the aspect ratio. |
| **Scale** | Uses a fixed scale level. Set the level with the **Scale Level** slider in the session's view controls. |

## Default Capture Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Capture cursor** | off | Includes the remote cursor in the stream for new sessions. |
| **Enable DirectX** | on | Uses DirectX for screen capture. It is faster on Windows. Turning it off can improve compatibility in some situations. |

## Default Encoding Settings

One select field, **Encoding Format**.

| Option | Description |
|--------|-------------|
| **WebP (less bandwidth, higher quality, slower encoding)** | Smaller frames and better quality at the cost of encode time. |
| **JPEG (more bandwidth, lower quality, faster encoding)** | The default. Quicker to encode, so it suits fast-moving screens. |

## Default Quality Settings

The header of this section carries a **Restore Defaults** button. It resets the quality numbers (**Auto Quality Maximum**, **Auto Quality Minimum**, **Auto Quality Lower Threshold**, **Auto Quality Upper Threshold**, **Manual Quality**, and **Max Mbps**) to their defaults. It does not touch the two switches below.

### Quality Mode

| Setting | Default | Description |
|---------|---------|-------------|
| **Enable auto quality** | off | Adjusts image quality based on the remote sender's outbound bandwidth. With it off, the fixed **Manual Quality** value is used. |

When **Enable auto quality** is off, the section shows **Manual Quality** as a number field and a matching slider. It is a JPEG quality value from 1 to 100. Default: 75. This one control saves a short moment after you stop moving it rather than on every step.

When **Enable auto quality** is on, the section shows four fields instead.

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| **Auto Quality Maximum** | 80 | 2 to 100 | Highest quality used while outbound bandwidth stays below the lower threshold. |
| **Auto Quality Minimum** | 20 | 1 to 99 | Lowest quality used once outbound bandwidth reaches the upper threshold. |
| **Auto Quality Lower Threshold** | 5 Mbps | 1 Mbps and up | Quality starts dropping after outbound bandwidth rises above this value. |
| **Auto Quality Upper Threshold** | 15 Mbps | 2 Mbps and up | Quality reaches the minimum once outbound bandwidth reaches this point. |

The fields keep each other consistent. Raising the minimum above the maximum pushes the maximum up, and the thresholds are kept apart the same way.

### Bandwidth Cap

| Setting | Default | Description |
|---------|---------|-------------|
| **Enable Max Mbps** | off | Sets a hard outbound bandwidth cap. |
| **Max Mbps** | 15 | The cap in megabits per second. Capture on the remote end pauses while usage is above the cap and resumes once it falls back below it. |

## Preferences Set Elsewhere

Four more user preferences exist. They are not on this page. The Dashboard toolbar sets them, and they persist the same way.

| Setting | Description |
|---------|-------------|
| **Hide offline** | Hides disconnected devices from the device grid. On by default. It is disabled while a search term is entered. |
| **Open in new tab** | Opens device access from the Dashboard in a new browser tab. On by default. |
| **Show only untagged** | Limits the grid to devices with no tags. Off by default. |
| **Show only ungrouped** | Limits the grid to devices in no device group. Off by default. |

See [Dashboard](/docs/user-guide/dashboard) for where these controls sit.

## Not On This Page

Account security is not part of the Settings page. The sidebar entry **Account** opens `/Account/Manage`, which carries **Profile**, **Email**, **Password**, **Passkeys**, **External logins**, **Two-factor authentication**, and **Personal data**.

Two-factor authentication is configured on `/Account/Manage/TwoFactorAuthentication`. The sidebar entry there is **Two-factor authentication**.

Email changes happen on `/Account/Manage/Email`, under the heading **Manage email**. Enter the address in **New Email** and choose **Change email**. Nothing changes until you open the confirmation link that is sent to the new address. When the current address is still unconfirmed, the page also shows a **Send verification email** button for it.

Server-wide settings live on the tenant and server settings pages, not here. See [Tenant Settings](/docs/user-guide/tenant-settings).

## Next

- **[Dashboard](/docs/user-guide/dashboard)**: Overview of all devices
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
