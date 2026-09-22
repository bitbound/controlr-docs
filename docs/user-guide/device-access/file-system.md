---
sidebar_position: 4
title: File System
---

## Overview

The File System browser shows a remote device's folders and files in a split-pane layout. A folder tree on the left and a data grid on the right are both read through the agent on the device. The available operations are browse, search, upload, download, create folder, and delete. There is no rename and no move.

## Accessing the File System

1. Open the device in Device Access. On the [Dashboard](/docs/user-guide/dashboard), open that device's **Actions** menu and choose **Device Access**.
2. Click **File System** in the device access menu.
3. Or go directly to `/device-access/file-system?deviceId={id}`.

Every operation needs the device to be online. A request that reaches an offline device fails with `Device is currently offline.`

## Interface

| Area | Description |
|------|-------------|
| Address bar | Labeled **Address**. Type a path and press Enter, or click the arrow icon at the end of the field. The path is validated on the device and the tree expands to it. A path that does not exist produces a warning and no navigation. |
| Folder tree | Headed **Folders**. Lists the device's drives at the root and loads subfolders as you expand a node. The first drive is selected when the page loads. |
| Splitter | Drag the divider between the panels. The tree holds at 200 px and the grid at 300 px. |
| Data grid | Files and folders in the open folder. Columns are a checkbox, an icon, **Name**, **Size**, and **Modified**. Directories sort before files, then by name. 50 rows per page. |
| Search box | Placeholder **Search current directory**. Filters the rows already loaded for the open folder. It does not query the device. |
| Toolbar | **Upload**, **Download**, **Delete**, **New Folder**, a refresh icon, and an up-one-level arrow. Below the large screen breakpoint the four labeled buttons render as icon buttons with tooltips. |

**Name** and **Modified** are sortable. **Size** is not sortable. The icon column is neither sortable nor filterable. The filterable columns also show filter icons, which are separate from the search box.

## Browsing

- Click a folder in the tree to open it. Double-click a node to expand it.
- Click a folder row in the grid to open it.
- Click the up-arrow icon to open the parent folder. It is disabled when the open path is a drive root.
- Click the refresh icon to reload the open folder.

## Selecting Items

- Click the checkbox on a row.
- Click a file row to toggle it. Files toggle on a plain click.
- Ctrl+click a folder row to toggle it without opening it. Only the Ctrl key is checked, so a Cmd+click on macOS opens the folder instead of toggling it.
- Selecting a row leaves the other selected rows selected.
- Changing folders clears the selection.

## Uploading

1. Open the destination folder. **Upload** is disabled while no folder is open.
2. Click **Upload**. A file picker opens and you can select several files at once. There is no drop target on this page.
3. The selected files upload at the same time, over the SignalR connection to the server.
4. Each upload shows its own snackbar with the file name, a progress bar, the percentage, bytes transferred out of the total, and throughput. The snackbar stays up for the whole transfer and closes when that file is done. Its **Cancel** action stops that file and leaves the others running.
5. If a file with the same name already exists in the folder, a **File Already Exists** dialog appears. **Overwrite** replaces it. **Cancel** skips that file.
6. The grid reloads when the uploads finish.

## Downloading

1. Select one or more rows. **Download** is disabled until something is selected.
2. Click **Download**. There is no per-row download button.
3. With one item selected, the browser saves it under its own name.
4. With two or more items selected, the page requests a ZIP instead. The agent builds the archive in a temporary file on the device. Folders are included recursively, and an empty folder is kept as an empty entry.
5. The archive is named `{folder-name}-download-{UTC timestamp}.zip` after the folder you have open. It is named `controlr-download-{UTC timestamp}.zip` when the open path has no folder name.

The page reports the download as started the moment the browser issues the request. Downloads have no progress display and no completion message.

## Creating a Folder

Click **New Folder** and enter a name in the **Create New Folder** prompt. The folder is created inside the folder you have open. An empty name cancels the prompt.

## Deleting

1. Select rows and click **Delete**.
2. Confirm in the **Confirm Delete** dialog. It names the item for a single selection and lists the count and the names for several.
3. The deletions run at the same time. A partial failure reports `One or more items failed to delete`, and the selection is kept so you can retry.

## Permissions

Every device-access page also needs `device.read`. Opening this page and every browse request need `device.file-system.read`. The other operations are separate codes.

| Code | Grants |
|------|--------|
| `device.file-system.read` | Opens the page. Folder tree, address-bar navigation, directory contents, and path validation. |
| `device.file-system.write` | **New Folder**. Also gates the uploads this page sends over the SignalR hub. |
| `device.file-system.delete` | **Delete**. |
| `device.file-system.transfer-download` | **Download**, single files and archives alike. |
| `device.file-system.transfer-upload` | Uploads through the HTTP API at `POST /api/v1/device-file-system/upload/{deviceId}`. This page does not use that route. |

A user with only the read code can open the page and browse. The page does not hide or disable the other buttons for that user. A blocked **New Folder** or **Delete** comes back as an error snackbar. A blocked upload is refused with `Unauthorized`. A blocked **Download** still reports that it started, because the page reports success before the server answers.

## File Transfer Limits

`ControlR_AppOptions__MaxFileTransferSize` sets the cap in bytes. The default is `104857600`, which is 100 MiB. See the [configuration reference](/docs/configuration) for how to set it.

Use a negative value for unlimited transfers, for example `-1`. Do not use `0`. The server treats any value at or below `0` as unlimited. The web client treats only negative values as unlimited, so at exactly `0` it compares every file against a zero-byte limit. Every non-empty upload is then refused with a message such as `exceeds the maximum upload size of 0.00 MB`, and every non-empty file in a download selection is refused with `exceed the maximum download size of 0.00 MB`.

The client checks file sizes before a transfer starts. The server checks again on the way through. An oversized download or HTTP upload is refused with HTTP 413. An oversized upload over the hub is refused with the byte limit in the message. Folders in a multi-select download are not size-checked on the client because their sizes are unknown, so the server's archive check is the one that applies.

## Next

- **[Dashboard](/docs/user-guide/dashboard)**: Overview of all devices
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Screen streaming and control
- **[Device Access: Terminal](/docs/user-guide/device-access/terminal)**: Remote shell access
