---
sidebar_position: 4
title: Manage A Build Slot
---

## Open A Slot

From the dashboard, each slot your entitlement grants appears as a card. Select **Configure slot** to open a slot you can edit. If you have read-only access to a slot, the button reads **View slot** and saving is disabled. The button label follows your access on that slot. It does not change based on whether the slot has already been set up.

The slot page has three areas: a configuration form, a private-assets panel, and a builds panel.

## Configure The Slot

Fill in the slot configuration form and select **Save configuration**. The form chip reads **Unsaved changes** while there is something to save and **Saved** otherwise. A build needs a saved configuration with a source ref chosen, so save before your first build. Every field, its validation rules, and its limits are listed in [Slot Configuration Reference](/docs/subscriber-portal/slot-configuration).

| Field | What it sets |
|-------|--------------|
| Brand name | The brand or company name shown in the built app. Required. |
| Publisher | The publisher shown as the author of the built app. |
| Source ref | The ControlR version the slot builds. Choose from the available releases. Preview `-dev` tags appear only when **Enable preview builds** is on in [Settings](/docs/subscriber-portal/settings). |
| Delivery format | How the built server reaches you. Either Docker image (a container image in the private registry) or ZIP download (a self-contained server archive). See [Delivery format](/docs/subscriber-portal/slot-configuration#delivery-format). |
| Server runtime | The platform the server is built for. Docker offers linux-x64 (AMD/Intel) or linux-arm64 (ARM). ZIP adds win-x64 (Windows). |
| ControlR server URL | A required, full http/https URL stored on the slot. The reference page covers what this field does and does not do. |

Under **Dark theme colors** and **Light theme colors** you set seven colors for each theme: Primary, Secondary, Tertiary, Info, Success, Warning, and Error. All fourteen are required. Each color is a hex value such as `#RRGGBB` or `#RRGGBBAA`. The fields start with the standard ControlR colors. Select the swatch next to a field to pick a color, or type the value.

You can also select **Export JSON** to download the current configuration and **Import JSON** to load one you saved earlier. This is a quick way to copy settings between slots. The exported file covers form values only. It carries no assets. See [Slot Configuration Reference](/docs/subscriber-portal/slot-configuration#export-and-import-configuration-json) for the file shape.

## Upload Branded Assets

The private-assets panel holds the image files that appear in your build. There are three asset types.

- **App icon (.png/.svg)**, used as the application icon.
- **Favicon (.ico)**, used as the browser icon.
- **Logo (.png/.svg)**, used as the company logo.

For each one, select **Upload asset**. After an upload, the button becomes **Replace asset**. The panel shows a preview plus the file name, content type, and size of what is stored. If a stored asset ever goes missing from storage, the panel warns you so you can re-upload it. Accepted file types, the size limit, and what a replacement does to the next build are covered in [Slot Configuration Reference](/docs/subscriber-portal/slot-configuration#private-assets).

## Run A Build

The builds panel drives the build process.

1. On the slot page, go to the **Builds** panel.
2. Select **Trigger build**. The portal starts a build for the slot using the configuration saved on the slot and the assets stored on it. A slot with zero uploaded assets still builds.
3. Watch the latest status. The panel does not poll on its own while a build runs, so select **Refresh status** to pull the newest state from GitHub.

While a build is running, the trigger button becomes **Cancel build**. The portal asks you to confirm, since cancelling asks GitHub to stop the underlying run. Confirm with **Cancel build** or leave it running with **Keep building**. See [Build Lifecycle](/docs/subscriber-portal/build-lifecycle) for what cancelling does and does not guarantee.

### Build Statuses

A build moves through these states in order:

1. `pending_validation`, the portal has recorded the build and has not received a workflow run from GitHub yet.
2. `queued`, GitHub has accepted the run and it is waiting to start.
3. `running`, the build is actively building.
4. One final state: `succeeded`, `failed`, or `canceled`.

The values are shown exactly as listed, and the last three are final. A build can also jump from `pending_validation` straight to `failed` when the dispatch never reaches GitHub or GitHub never returns a run for it. The status display is the portal's mapping of the GitHub run, so a run that GitHub skipped shows as `canceled`. When a build fails, the panel shows a failure summary when one is available.

## Read The Build History

Below the current build, the **Recent build history** list shows past builds newest first. Each row carries a build timestamp, a status chip, the source ref, the duration, and the requested and completed times, plus a failure summary when one exists. The rows are read-only. They are not clickable and they open nothing. A history row never shows an image reference or a pull command. The **Image delivery** block belongs to the latest build only. See [Build Lifecycle](/docs/subscriber-portal/build-lifecycle#build-history-and-retention) for how long history is kept.

## Get The Image

When a build succeeds, the builds panel shows an **Image delivery** block with the produced image and a pull command. Select **Copy pull command** to copy the command you use to pull the image from the private registry. The command is masked until you reveal it. Viewing and copying it requires access to registry credentials for that slot. See [Getting Your Image](/docs/subscriber-portal/getting-your-image) for the full command, where the credential comes from, and how long a copied command keeps working. See [Organization Access](/docs/subscriber-portal/organization-access) for how that access is granted in an organization.

## What You Can Do On A Slot

Your access on a slot is made up of separate permissions. Changing the configuration and uploading assets need **Write** access. Triggering and cancelling builds need **Execute** access, which is granted on its own. **Read** access lets you view the configuration and build history but not change them. Someone can therefore have write access without being able to start a build. See [Organization Access](/docs/subscriber-portal/organization-access) for how these are assigned.
