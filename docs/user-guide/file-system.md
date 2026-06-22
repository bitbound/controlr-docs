---
sidebar_position: 2
title: File System
---

## Overview

The File System browser manages remote device files through a split-pane interface with tree navigation and a sortable data grid.

## Accessing the File System

1. Navigate to a device's page (click the device card from the Dashboard)
2. Click **File System** in the device access menu
3. Or go directly to `/device-access/file-system?deviceId={id}`

## Interface

The File System page uses a split-pane layout with a draggable splitter between them:

| Panel | Description |
|-------|-------------|
| **Left Panel** | Tree-view folder navigation — expand folders to browse the file system |
| **Right Panel** | Sortable/filterable data grid — shows files and folders in the current directory |

## Operations

### Browsing

- Click folders in the tree view to navigate
- Use the address bar to type a path directly
- Use the search box to filter files and folders

### Uploading

1. Select the destination folder in the right panel
2. Click **Upload** or drag files into the upload area
3. Monitor progress in the transfer panel

### Downloading

| Method | Description |
|--------|-------------|
| **Single File** | Click the download icon on any file |
| **Archive Download** | Select one or more files/folders, then click **Download Archive** to download a ZIP |

### Managing Files

| Action | Description |
|--------|-------------|
| **New Folder** | Create a new directory in the current location |
| **Rename** | Rename a selected file or folder |
| **Delete** | Remove selected files or folders (with confirmation) |
| **Multi-select** | Hold Ctrl/Cmd to select multiple items for batch operations |

## File Transfer Limits

The maximum file transfer size is configurable via `ControlR_AppOptions__MaxFileTransferSize` (default: 100 MB). Set to `0` or below for no limit.

## Next

- **[Dashboard](/docs/user-guide/dashboard)** — Overview of all devices
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)** — Screen streaming and control
- **[Terminal](/docs/user-guide/terminal)** — Remote terminal access
