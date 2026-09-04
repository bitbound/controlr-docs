---
sidebar_position: 1
title: Devices & Tags
---

## Device Access

Device access is governed by permission assignments, not tags. A user can view or operate on a device when they hold the relevant permission (e.g. `device.read`, `device.remote-control.connect`) at a scope that covers that device -- a specific device, a device group, a customer, or the whole tenant.

See [Permissions](/docs/user-guide/permissions) for how to grant device access, and the [Permission System](/docs/permission-system) for the full model.

## Tags

Tags are string labels used to organize and filter devices. They are no longer used for access control.

### Managing Tags

1. Navigate to **Tags** in the web interface (`/tags`)
2. Use the **Tags** tab to create, rename, or delete tags
3. Assign tags to devices through the **Devices** tab

### Tag Validation

- Tag names must match `[a-z0-9-]` (lowercase letters, digits, and hyphens only)
- Max length: 100 characters
