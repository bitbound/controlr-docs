---
sidebar_position: 2
title: Devices & Tags
---

## Device Access

Device access is governed by permission assignments, not tags. A user can view or operate on a device when they hold the relevant permission (e.g. `device.read`, `device.remote-control.connect`) at a scope that covers that device. The scope can be the specific device, a device group, a customer, the whole tenant, or the whole server.

See [Permissions](/docs/user-guide/permissions) for how to grant device access, and the [Permission System](/docs/permission-system) for the full model.

## Device Identity

Each device is identified by a GUID. The installer generates a random one, or uses the id you pass with `--device-id`, and saves it on the machine so reinstalls keep the same identity. The device id is the key of the device record, so no two devices share one.

The device name is the computer name the agent reports (the DNS host name on Windows). It is display data, not an identifier, and names do not need to be unique. A separate alias can be set on a device. Editing the alias requires the `device.alias.write` permission.

## Device Lifecycle

Device management lives on the Dashboard. Each device row has an Actions menu. Two actions are easy to confuse:

- **Uninstall** is offered for online devices. It sends a command over the agent connection, and the agent runs its own local uninstaller. The agent software is removed from the machine. The device record stays on the server until you remove it.
- **Remove** is offered for offline devices. It deletes the device record from the server database and nothing else. The machine is not contacted. If an agent is still installed there, it stays installed, and its later connections are rejected as an unknown device unless agent self-registration is enabled on the server, in which case a fresh record is created.

Both actions require the `device.delete` permission, evaluated against the target device.

Server decommissioning is a separate, configuration-only switch (`ServerLifecycle:DecommissionServer`, default off). When it is on, every agent that connects is told to uninstall itself and its device record is deleted. The web interface shows a banner to all signed-in users while it is active. There is no in-product toggle for it.

## Device Groups

A device group is a named set of devices, managed on the **Device Groups** page. Names are unique per tenant and limited to 100 characters, with an optional description up to 500 characters. A device can belong to more than one group.

Groups matter for access control. A permission assignment can be scoped to a device group, so one grant covers every member device. Managing the group list requires `tenant.device-groups.read` / `tenant.device-groups.write`, and moving devices in or out requires `device-group.assign-devices`.

## Tags

Tags are string labels used to organize and filter devices. They do not grant access. Device authorization resolves permission scopes over devices, device groups, customers, and tenants, and tags take no part in that evaluation. Assigning or removing a tag never changes who can reach a device.

### Managing Tags

1. Navigate to **Device Tags** in the sidebar (the page lives at `/tags`). The link appears in the Tenant Admin section only for holders of the `tenant.tags.write` permission, which is also what the page requires.
2. The page has two tabs. On the **Tags** tab, create a tag in the **Create New Tag** field (press Enter or click the tag icon), select a tag, then use the **Rename Tag** and **Delete Tag** buttons. The device list beside it lets you toggle which devices carry the selected tag.
3. The **Devices** tab works in the other direction. Pick a device, then toggle each tag on or off with its switch.

Assigning or removing a tag on a device requires the `device.tags.write` permission on that device. Viewing a device's tags requires `device.tags.read`.

### Tag Validation

- Tag names may contain lowercase letters, digits, and hyphens only (`[a-z0-9-]`). The validation message in the app also mentions underscores, which is wrong. Underscores are rejected.
- Max length: 50 characters, enforced by the client and the database column.
- Names are unique per tenant. A unique index on name plus tenant is enforced in the database, and the UI rejects a duplicate name as you type.
- Deleting a tag removes it from every device that carried it.
