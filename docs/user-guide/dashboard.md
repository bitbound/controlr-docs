---
sidebar_position: 0
title: Dashboard
---

## Overview

The Dashboard is where you land after signing in. The sidebar entry is **Home**, the address is `/`, and the page heading reads **Devices**.

It is a server-paged data grid, not a set of cards. The rows are only the devices your permission grants reach. Filtering, searching, sorting, and paging each send a new request to the server.

While the page is open, the browser subscribes to heartbeat updates for the devices on the current page. Status, CPU, memory, and storage for those rows change in place. A reconnect to the server hub reloads the grid.

If your account cannot see a single device, an info bar appears with a link to the **Deploy Page** in place of the grid.

## Columns

The columns appear in this order.

| Column | Content |
|--------|---------|
| **Actions** | The row's action menu and a remote-control button. See [Row actions](#row-actions). |
| **Name** | The device name the agent reports. This column stays pinned to the left edge while you scroll sideways. |
| **Alias** | The friendly name you set. Blank when no alias is set. |
| **Online** | An icon only. A check with the tooltip **Online**, a warning with the tooltip **Online (Outdated)** when the agent is behind the server's current agent version, or a cancel icon with the tooltip **Offline**. No timestamp is shown here. |
| **Customer** | The customer the device belongs to. A single dash placeholder appears when there is no customer. |
| **Platform** | An operating-system icon with the tooltip **Windows**, **macOS**, **Linux**, or **Unknown Platform**. This column does not show CPU architecture. |
| **Current Users** | Names of the users signed in on the device, comma-separated. |
| **CPU** | CPU utilization as a percentage. |
| **Memory** | Memory used as a percentage. |
| **Storage** | Used space on the OS drive as a percentage. |
| Row expander | The final column has no header text. Its chevron expands the row detail. |

**Online** and **Name** carry built-in sort definitions, and the grid allows sorting on several columns at once. Every column except **Actions** can be hidden from the column options. Filters exist on every column except **Actions** and **Current Users**, which declare no sorting and no filtering. The pager defaults to 25 rows per page and reports the filtered result set as `Online: n`, `Offline: n`, `Total: n`.

## Row Detail

The chevron in the last column expands the row. The expanded content is the same device overview shown on the **Overview** page of Device Access, grouped into **Device Summary**, **System Information**, **Networking**, **CPU Usage**, **Memory Usage**, and one **Hard Drive** block per drive.

Values that are not columns live here.

- **Agent Version** and **Last Seen**, both under **Device Summary**. **Last Seen** is the timestamp the grid does not show.
- **Id**, with a button whose tooltip is **Copy ID**.
- **Active Users**, which appears only when at least one user is signed in.
- **OS Description**, **Architecture**, **Processor Count**, **Total Memory**, **Total Storage (OS)**, and **Used Storage (OS)**.
- **Public IPv4**, **Public IPv6**, **Local IPv4**, **Local IPv6**, **DNS Hostname**, and **MAC Addresses**.

The alias is edited here too. Choose the button whose tooltip is **Edit Alias**, enter up to 100 characters, then choose **Save** or **Cancel**. Enter saves and Escape cancels.

## Row Actions

The three-dot button in the **Actions** column opens a menu. Its contents depend on whether the device is online.

| Menu item | Present when | Confirmation |
|-----------|--------------|--------------|
| **Device Access** | always | none. Opens the device's Device Access page. |
| **Refresh** | online | none. Asks the agent to re-report its information. |
| **Update** | online and the agent version is behind | none |
| **Shutdown** | online | a **Confirm Shutdown** dialog |
| **Restart** | online | a **Confirm Restart** dialog |
| **Uninstall** | online | a **Confirm Uninstall** dialog |
| **Wake** | offline | none. Needs at least one MAC address on the device record, otherwise you get a **No MAC addresses on device** notice. |
| **Remove** | offline | a **Confirm Removal** dialog with **Remove** and **Cancel** |

**Device Access** is the route to remote control, terminal, chat, file system, remote logs, and VNC relay. Those are separate entries in the left navigation of the Device Access page, not on the Dashboard.

The button beside the menu has the tooltip **Remote Control**. It is disabled while the device is offline. When **Open in new tab** is checked, both this button and **Device Access** open in a new browser tab instead of replacing the Dashboard.

Nothing happens when you click a row. There is no row click handler. The ways into a device are the action menu, the remote-control button, and the row expander.

The grid has no selection column and no bulk action. Every command on this page is sent for one device at a time.

## Filters And Search

- A search box with the placeholder **Search devices**. Input is debounced, the box is clearable, and the term is matched on the server.
- **Filter by customer**, a multi-select of the tenant's customers. The field label collapses to text such as `2 customers selected`. It is clearable.
- **Filter by device group**, a multi-select of the tenant's device groups, with a **Match** toggle of **Any** or **All** and a **Show only ungrouped** switch.
- **Filter by tags**, a multi-select of the tenant's tags. Typing while the list is open narrows the entries. It has its own **Match** toggle of **Any** or **All** and a **Show only untagged** switch. Selecting every tag shows `All tags selected`.
- **Hide offline**, a checkbox.
- **Open in new tab**, a checkbox.
- A button with the tooltip **Refresh**, which reloads the grid.

Behavior worth knowing.

- Typing a search term disables **Hide offline** and includes offline devices in the results.
- Turning on **Show only untagged** clears the tag selection and disables the tag filter and its match toggle. Picking a tag switches it back off. **Show only ungrouped** and the device group filter pair the same way.
- **Hide offline**, **Open in new tab**, **Show only untagged**, and **Show only ungrouped** are saved as user preferences and restored on your next visit. Customer, device group, tag, and search values are not saved.

Tags are labels used for filtering and organizing. They do not appear in the authorization model as a grant scope, so no tag can grant or remove access to a device.

## Permissions

The rows are limited to the devices your grants reach. The Dashboard does not hide action buttons based on permission. A command you are not allowed to send is refused by the server and a failure notice appears. The commands map to these permission codes.

| Action | Permission code | Catalog name |
|--------|-----------------|--------------|
| **Refresh** | `device.read` | Read Device |
| **Shutdown**, **Restart** | `device.power.manage` | Manage Device Power |
| **Wake** | `device.wake.send` | Send Wake Command |
| **Uninstall**, **Remove** | `device.delete` | Delete Device |
| **Update** | `device.agent.update` | Update Device Agent |
| Edit the alias in the expanded row | `device.alias.write` | Update Device Alias |

The Device Access page does hide entries. Navigation links for capabilities you lack are not shown there.

## Connection Status

The icon in the top bar shows the connection between the browser and the server hub. It is not device online status.

| Indicator | Meaning |
|-----------|---------|
| Green bolt, tooltip **Connected** | Connected in the browser. Real-time updates are flowing. |
| Blue bolt, tooltip **Connected (server-side rendered)** | The hub reports connected while the indicator is rendering on the server rather than in the browser. |
| Spinning indicator, tooltip **Reconnecting** | The client is connecting or reconnecting. |
| Bolt-slash icon, tooltip **Disconnected** | Not connected. Reconnect attempts continue with an increasing delay. |
| Bolt-slash icon titled **Disabled** | There is no interactive hub connection to report, such as a static server-rendered pass or a browser that is not signed in. |

## Theme

The theme control is a menu, not a toggle. Its icon shows the current mode and its tooltip reads **Theme: Light** or **Theme: Dark**. The menu lists **Light** and **Dark**, and the current mode carries a check mark. Choosing a mode shows a `Theme set to Light` notice and, when you are signed in, saves the choice as your user preference. On the main layout the menu appears once you are signed in.

## Next

- **[Device Overview](/docs/user-guide/overview)**: The content of the expanded row and the Device Access overview page
- **[Device Access: Remote Control](/docs/user-guide/device-access/remote-control)**: Stream and control device screens
- **[Devices & Tags](/docs/user-guide/devices)**: Organize devices with tags and device groups
