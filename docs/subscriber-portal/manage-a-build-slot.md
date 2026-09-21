---
sidebar_position: 3
title: Manage A Build Slot
---

## Open A Slot

From the dashboard, each unlocked slot appears as a card. Select **Configure slot** on an available slot, or **Open slot** on one you have already set up. If you have read-only access to a slot, the button reads **View slot** and saving is disabled.

The slot page has three areas: a configuration form, a private-assets panel, and a builds panel.

## Configure The Slot

Fill in the slot configuration form and select **Save configuration**. The form tracks unsaved changes, so you can tell when there is something to save.

| Field | What it sets |
|-------|--------------|
| Brand name | The brand or company name shown in the built app. Required. |
| Publisher | The publisher shown as the author of the built app. |
| Source ref | The ControlR version the slot builds. Choose from the available releases. |
| Server runtime | The platform the server image is built for. Either linux-x64 (AMD/Intel) or linux-arm64 (ARM). |
| ControlR server URL | The URL your agents and clients use to reach this server. Required, full http/https URL. |

Under **Dark theme colors** and **Light theme colors** you set seven colors for each theme: Primary, Secondary, Tertiary, Info, Success, Warning, and Error. Each color is a hex value such as `#RRGGBB` or `#RRGGBBAA`. Select the swatch next to a field to pick a color, or type the value.

You can also select **Export JSON** to download the current configuration and **Import JSON** to load one you saved earlier. This is a quick way to copy settings between slots.

## Upload Branded Assets

The private-assets panel holds the image files that appear in your build. There are three asset types.

- **App icon**, a `.png` or `.svg` file.
- **Favicon**, a `.ico` file.
- **Logo**, a `.png` or `.svg` file.

For each one, select **Upload asset**. After an upload, the button becomes **Replace asset**. The panel shows the file name, content type, and size of what is stored. If a stored asset ever goes missing from storage, the panel warns you so you can re-upload it.

## Run A Build

The builds panel drives the build process.

1. On the slot page, go to the **Builds** panel.
2. Select **Trigger build**. The portal starts a build for the slot using its current configuration and assets.
3. Watch the latest status. Select **Refresh status** to pull the newest state.

While a build is running you can select **Cancel build**. The portal asks you to confirm, since cancelling also cancels the underlying run. Confirm with **Cancel build** or leave it running with **Keep building**.

### Build Statuses

The status shown in the builds panel comes straight from the build system. The values you can see are:

- `queued`, waiting to start.
- `running`, actively building.
- `pending_validation`, finished but awaiting a validation check.
- `succeeded`, the build completed and produced an image.
- `failed`, the build stopped with an error.
- `canceled`, the build was cancelled.

The last three are final states. When a build fails, the panel shows a failure summary when one is available.

## Read The Build History

Below the current build, the panel lists recent builds with their status, version, duration, and timestamps. Select a build to see its details. Use the history to find the image from a specific past build.

## Get The Image

When a build succeeds, the builds panel shows an **Image delivery** block with the produced image and a pull command. Select **Copy pull command** to copy the command you use to pull the image from the private registry. Viewing and copying the pull command requires access to registry credentials for that slot. See [Organization Access](/docs/subscriber-portal/organization-access) for how that access is granted in an organization.

## What You Can Do On A Slot

Your access on a slot is made up of separate permissions. Changing the configuration and uploading assets need **Write** access. Triggering and cancelling builds need **Execute** access, which is granted on its own. **Read** access lets you view the configuration and build history but not change them. Someone can therefore have write access without being able to start a build. See [Organization Access](/docs/subscriber-portal/organization-access) for how these are assigned.
