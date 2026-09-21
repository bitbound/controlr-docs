---
sidebar_position: 2
title: Terminal
---

## Overview

The Terminal provides remote shell access on every connected device. ControlR ships an embedded cross-platform PowerShell host, available on Windows, macOS, and Linux. The PowerShell runspace runs inside the agent service, not in the desktop user's session. That means it executes as the service account (LocalSystem on Windows, root on Linux and macOS) and starts in the agent's install directory.

Access requires the `device.terminal.use` permission. It gates the menu entry and every terminal call (opening and closing the session, sending input, and fetching completions).

## Accessing the Terminal

1. Navigate to a device's page
2. Click **Terminal** in the device access menu (or go to `/device-access/terminal?deviceId={id}`)

## Features

| Feature | Description |
|---------|-------------|
| **PowerShell** | Embedded PowerShell 7 (PowerShell SDK) on all platforms. There is no fallback to a system shell |
| **Command Completions** | PowerShell-native completions for commands, parameters, parameter values, variables, and file paths. Tab cycles forward, Shift+Tab cycles backward, and Ctrl+Space or Ctrl+. opens the full list (up to 500 matches) |
| **Multiline Input** | Toggle that grows the input field to six lines for multi-line scripts |
| **Keyboard Shortcuts** | A **Keyboard Shortcuts** dialog opens from the "?" button below the input |

## Usage

1. Type commands in the input field, labeled "Enter a command"
2. Press Enter to execute. There is no run button, Enter is the only submit
3. Use Tab for command autocompletion and Arrow Up / Arrow Down to recall previous commands
4. Toggle **Multiline Input** for scripts that span several lines. Plain Enter still submits even in multiline mode, so press Shift+Enter to insert a newline. Arrow Up / Arrow Down history recall is disabled while multiline mode is on
5. Copy and paste use the browser's native clipboard behavior. The page has no dedicated copy or paste control

### Keyboard Shortcuts

The dialog lists these shortcuts:

| Keys | Action |
|------|--------|
| Tab | Next completion |
| Shift + Tab | Previous completion |
| Ctrl + Space | Show all completions |
| Ctrl + . | Show all completions |
| Enter | Execute command |
| Shift + Enter | New line (multiline mode) |
| Arrow Up | Previous command |
| Arrow Down | Next command |
| Escape | Close completions. With no completion menu open, Escape clears the input |

## Output Display

Terminal output displays scrollable command history. Only the most recent 500 output entries are kept. Older lines are dropped as new output arrives. Input history is likewise capped at 500 commands. Nothing is stored on the server or after a page reload, so refreshing the browser starts a fresh session with an empty history.

## Session Lifetime

The agent keeps your terminal session alive for 10 minutes after the last activity. When it expires, the PowerShell runspace is disposed and the next command transparently starts a new session. Variables, functions, and the current directory from the old session are gone. The new session opens in the agent's install directory. Commands that show a host prompt, such as `Read-Host`, wait at most 5 minutes for an answer before the prompt receives empty input.

## Next

- **[Device Overview](/docs/user-guide/overview)**: View device details and manage actions
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
