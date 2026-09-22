---
sidebar_position: 3
title: Chat
---

## Overview

Chat is real-time messaging with the user of a desktop session on a connected device. It works across all supported platforms (Windows, macOS, and Linux). Access requires the `device.chat.send` permission. It gates the menu entry, sending messages, and opening or closing a chat session.

The page also needs `device.remote-control.connect`. The desktop session list that Usage starts from is fetched by a remote-control method, not a chat method. A caller holding only `device.chat.send` sees the **Chat** entry in the menu, then gets "An error occurred while loading desktop sessions." and an empty list.

Messages are delivered over the agent's local IPC channel to the ControlR desktop client running in the chosen session. The device therefore needs a desktop client for that session. If none is running, sending fails with "Failed to send message" and your composed text is kept in the input field.

## Accessing Chat

1. Open the device in Device Access. On the [Dashboard](/docs/user-guide/dashboard), open that device's **Actions** menu and choose **Device Access**
2. Click **Chat** in the device access menu
3. Or go directly to `/device-access/chat?deviceId={id}`

## Usage

1. Pick a desktop session and click **Start Chat** on its card. **Refresh Sessions** reloads the list
2. Type your message in the input field, labeled "Enter a message"
3. Press Enter, or click the send icon at the end of the input field, to send
4. Toggle **Multiline Input** for multi-paragraph messages. In multiline mode Enter inserts a newline and Ctrl+Enter sends
5. Click the **Close Chat Session** button (the red X in the chat header) to end the session

Messages appear with the sender name and timestamp. The remote user answers in the chat window on their own machine.

## History

Chat history is not persisted anywhere. Messages live only in the browser for the duration of the session. They are cleared when you close the chat session, navigate away from the chat page, or reload the browser. The server logs delivery metadata (sender, device, session) but never message content, and there is no way to review previous sessions' messages.

## Interface

| Control | Description |
|---------|-------------|
| **Start Chat** | Session-card button that opens the chat for that desktop session |
| **Refresh Sessions** | Reloads the desktop session list |
| **Enter a message** | Input field label. The trailing send icon is the send control, it has no text label |
| **Multiline Input** | Six-line input where Enter adds a newline and Ctrl+Enter sends |
| **Close Chat Session** | Tooltip of the header button that ends the session |

## Connection States

| State | Description |
|-------|-------------|
| **Loading** | Connecting to the chat service |
| **Alert** | An error has occurred, with a **Reload** button |
| **Session Select** | Waiting for you to pick a desktop session |
| **Chat Active** | Chat session is active and messaging is available |
| **Unsupported OS** | Shown only for device platforms outside Windows, macOS, and Linux, so it is effectively unreachable on real deployments |

## Next

- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
- **[Device Access: File System](/docs/user-guide/device-access/file-system)**: Remote file management
