---
sidebar_position: 1
title: File System
---

## Overview

The File System browser lets you browse, upload, download, and manage files on remote devices directly from your browser.

## Accessing the File System

1. Navigate to a device's page
2. Click **File System** in the device access menu (or go to `/device-access/file-system?deviceId={id}`)

## Interface

The File System page uses a split-pane layout:

| Panel | Description |
|-------|-------------|
| **Left Panel** | Tree-view folder navigation — expand folders to browse the file system |
| **Right Panel** | Sortable/filterable data grid — shows files and folders in the current directory |

You can resize the split panes using the draggable splitter between them.

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

- **Single file:** Click the download icon on a file
- **Archive:** Select one or more files/folders, then click **Download Archive** to download a ZIP

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

- **[Device Management](/docs/features/device-management)** — Monitor and organize devices
- **[Terminal](/docs/user-guide/terminal)** — Remote terminal access
