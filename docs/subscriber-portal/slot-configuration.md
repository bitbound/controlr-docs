---
sidebar_position: 5
title: Slot Configuration Reference
---

## Overview

This page is the complete reference for a slot's configuration form, its branding assets, and what those settings actually change in a built ControlR product. For the day-to-day walkthrough, see [Manage A Build Slot](/docs/subscriber-portal/manage-a-build-slot).

## The Configuration Form

The form sits on the slot page under the **Slot configuration** heading. A chip in the corner reads **Unsaved changes** while your edits differ from what is saved, and **Saved** otherwise. The **Save configuration** button is disabled until there are unsaved changes and no field has a validation error. If you only have read access to the slot, the inputs render disabled and saving is unavailable.

The whole form is stored on the slot and reused by every build. A build reads the configuration that is saved at the moment you trigger it.

### Brand Name

Required. At most 120 characters. It must start with a letter and may contain letters, digits, spaces, underscores, hyphens, and periods. The form and the server both check the character rule. Neither one enforces the 120-character limit, and stored brand names are capped at 120 characters.

The brand name is the heart of the customization. The build pipeline also derives a machine identifier from it by replacing every non-alphanumeric character with an underscore. That derived key ends up in assembly prefixes, installer file names, and package names, so two brand names that differ only in punctuation collide.

### Publisher

Optional. At most 120 characters, with the same character rule as the brand name. If you leave it blank, the build uses the default ControlR publisher text ("Bitbound") in the places the publisher appears. Set it if your organization must be named as the author.

### Source Ref

Required. This picks the ControlR version the slot builds. The picker lists ControlR release tags that start with `v`, newest first, up to the 100 most recent. There is no "latest" option, you pick a specific version. The list refreshes in the portal about every 10 minutes. Very old releases are hidden when a minimum selectable version is configured.

A brand-new slot has no source ref selected. Until you choose one and save, the form shows the error "Choose a build ref." and triggering a build fails with "A source ref must be selected." The portal verifies the tag against the ControlR repository when you save, so a tag you type by hand must actually exist.

### Delivery Format

Required. The select sits above **Server runtime**. The two options are **Docker image** and **ZIP download**. A `docker` slot is preselected for a new slot and for any slot that never changed this field. Pick the format that matches how you plan to run the built server.

**Docker image** builds a container image and pushes it to the private registry. On a successful build the builds panel shows a pull command, as described in [Getting Your Image](/docs/subscriber-portal/getting-your-image).

**ZIP download** builds a self-contained server archive for the chosen runtime and stores it privately instead of building an image. On a successful build the builds panel shows a **Download server** button in place of the pull command. The panel notes that each download link is valid for a few minutes.

The format also gates the server runtime. Container delivery is Linux-only, so a **Docker image** slot offers only `linux-x64` and `linux-arm64`. **ZIP download** adds `win-x64` (Windows) to the list. See [Server Runtime](#server-runtime).

Switching a slot from ZIP back to Docker clears a `win-x64` runtime and resets it to `linux-x64`. If a saved combination is invalid, the form blocks it with "win-x64 requires ZIP delivery." and the server rejects the same combination. When the delivery format select has no value at all, the form shows "Choose a delivery format."

### Server Runtime

Required, with `linux-x64` preselected. The available choices depend on the [Delivery format](#delivery-format). A **Docker image** slot can build `linux-x64` (AMD/Intel hosts) or `linux-arm64` (ARM hosts). A **ZIP download** slot adds `win-x64` (Windows hosts). Pick the runtime that matches the machine that will host your ControlR server.

### ControlR Server URL

Optional. When set, a full absolute URL using http or https, at most 2048 characters. A blank value stores nothing on the slot.

The value is validated and stored on the slot, and it is shown back to you in the form, on the dashboard slot card, and in exported configuration JSON. It also rides to the builder in the same one-time customization payload that carries the brand, the colors, the icons, the CSS, and the sponsorship switch.

Its effect inside the product is specific to the agent. An agent built by a pipeline that received the address dials that address, and it does so in preference to the `-s` value passed to the installer and in preference to an address the agent already saved. So an agent from your build cannot be pointed at a different server with an installer argument, and moving those devices to another server means changing this field and rebuilding. Rebuild after changing it, since a build keeps whatever value was saved when you triggered it. The address your server itself serves is still runtime configuration you set when you run it, as covered in [Connect To ControlR](/docs/subscriber-portal/connect-to-controlr) and the server [Configuration](/docs/configuration) docs.

### Hide Sponsorship Info

Optional, and off by default. A single checkbox labeled **Hide sponsorship info**, carrying the form's own note that it "Hides the Project, Website, and Sponsor links in the built app's About page." Turning it on changes three places you can see. The About page drops its Project, Website, and Sponsor entries. The welcome screen drops its **View on GitHub** and **Sponsor Project** buttons, and the GitHub button in the top bar disappears. The third-party licenses list gains a ControlR entry with source and license links. The **MIT License** link on the About page stays whichever way you leave the switch, and the desktop client's About screen follows the same setting.

### Theme Colors

Fourteen color fields, seven under **Dark theme colors** and seven under **Light theme colors**: Primary, Secondary, Tertiary, Info, Success, Warning, and Error. All fourteen are required on every save, both in the form and on the server. Accepted format is `#RRGGBB` or `#RRGGBBAA`, and stored values are uppercased. Empty color fields are rejected with "Color is required." The form opens with the standard ControlR palette already filled in, so you only need to touch the colors you actually want to change. Each field has a swatch that opens a picker, and you can type the hex value directly.

### Custom CSS

Optional. A free-text stylesheet stored on the slot. Two inputs feed the same saved value. **Edit CSS** opens an editor where you paste CSS or select **Load .css file**. The **Upload .css** button beside the section loads a `.css` file straight into the form. A chip shows whether CSS is saved and how large it is. The limit is 64 KB. An oversized value is rejected with "Custom CSS must be at most 64 KB." Control characters are rejected with "Custom CSS must not contain control characters."

A build that receives a non-empty value replaces the built server's own stylesheet file with it, and the server's pages load that file. Leaving it empty keeps the stock stylesheet. The value also rides in configuration JSON export, so an export carries your CSS with it. The form's own on-screen text describes the CSS as applied to every page, and that is what a current build does. Rebuild after changing it, since a build keeps whatever CSS was saved when you triggered it.

## Save Behavior

Saving writes every field at once. Partial saves are not a thing. If any required field is blank or malformed, nothing saves and the offending fields show their errors. Server-side validation mirrors the form's rules and returns the same kind of messages, for example a brand name that starts with a digit is rejected with "Brand name must start with a letter and contain only alphanumeric characters, underscores, hyphens, spaces, and periods."

## Export And Import Configuration JSON

**Export JSON** downloads a file named `slot-{N}-configuration.json` holding the form values: brand name, publisher, ControlR server URL, source ref, server runtime, delivery format, saved custom CSS, the hide-sponsorship switch, and the full fourteen-color scheme, wrapped in a `controlr.slot-configuration` envelope with a version marker. Assets are not in the export. Build history is not in the export. Nothing about the slot's identity, like its number, is encoded, so an export from slot 1 imports cleanly into slot 2.

**Import JSON** loads such a file into the form. Import does not save. The portal tells you it imported and reminds you to review and save. On import the file must be valid JSON with the expected envelope kind and version, and the color entries must be valid hex or blank, or the import is rejected with a message naming the problem. A file that passes import still goes through the normal validation on save.

## Private Assets

The **Branding assets** panel stores the images your build replaces in the product. Three upload fields appear in each of three collapsible sections, **Default**, **Dark**, and **Light**. The three fields are the same in every section:

| Panel label | File picker accepts | Used in the product as |
|-------------|---------------------|------------------------|
| App icon (.png/.svg) | `.png`, `.svg` | The desktop application icon, plus resized web app icons |
| Shell icon (.ico) | `.ico` | The executable icon and the browser tab icon |
| Company logo (.png/.svg) | `.png`, `.svg` | The company logo image shipped with the web server |

A current build applies only the three **Default** images. The **Dark** and **Light** variants are stored on the slot and handed to the builder like the others, but nothing in a current build applies the theme-specific files, so uploading them changes nothing in the shipped product yet.

The rules that apply to all nine fields:

- One file per type. Uploading again replaces what was there. The button reads **Upload asset** when empty and **Replace asset** after that.
- The file must be non-empty, at most 3 MiB (3,145,728 bytes), and its content type must be one of `image/png`, `image/svg+xml`, or `image/x-icon`. The panel shows the stored file's name, content type, size, and a small preview.
- The portal stores the bytes you send. It does not decode or validate that the file is really a usable image. A corrupt file can upload successfully and still break a build or ship a broken icon.
- Assets are independent of the configuration form. They save the moment you upload, with no Save step, and they are excluded from configuration JSON export.
- Uploads and replacement are write-permission actions, gated by the slot's **Write** access.

If the stored file ever goes missing from the portal's file storage while its record remains, the panel shows "This asset is recorded in your slot but the file is missing from storage. Re-upload it to restore it." Upload the file again to repair it. A missing asset does not block builds, but the build cannot download an asset that is not there.

### How Assets Reach The Build

When you trigger a build, the portal hands the builder short-lived signed links to the asset files currently stored on the slot. The links expire 15 minutes after the build is requested, and the build downloads the images early in its run. The brand name and colors, by contrast, are snapshotted from the saved configuration at trigger time.

This gives you one practical rule. Replacing an asset affects the next build you trigger. If you replace an asset in the minutes right after starting a build, you can change what that build downloads, because the builder fetches assets by reference rather than from a snapshot. Re-upload assets between builds, not during one.

In the product itself, the app icon file is resized and distributed to the desktop application icon sets and the web app icon files. The favicon becomes the site's `favicon.ico`. The logo is shipped as the company logo image the web server serves. If a build has no icons at all, those files keep ControlR's default artwork.

## What Customization Actually Reaches The Product

The builder customizes the standard ControlR source at build time by rewriting branding strings, colors, and image files. It is the same product otherwise. Here is what each setting does, confirmed against the build pipeline:

- **Brand name.** Rewritten into the branding constants every component reads. The product name, install and service identifiers, web app manifest name and short name, several user-facing sentences in the UI text, and the derived underscore key in build prefixes and installer file names all follow it.
- **Publisher.** Rewritten into the publisher branding constant and the copyright-style text in application metadata.
- **Colors.** Your fourteen values replace the theme color constants, the theme brushes in the desktop client markup, and the web theme's CSS color values.
- **Images.** The three stored assets replace the shipped icon, favicon, and company logo files described above.
- **Custom CSS.** A non-empty value replaces the built server's stylesheet file.
- **Hide sponsorship info.** The switch is baked in, and the built app reads it at runtime as described in [Hide Sponsorship Info](#hide-sponsorship-info).
- **Source ref.** The image is built from exactly that release tag of the ControlR repository.
- **Server runtime.** The image targets that platform.

## What The Portal Does Not Let You Customize

None of the following are configurable through the portal, and each stays at the open-source ControlR default in your build:

- Product features and feature flags. You get the same feature set as the public build.
- Licensing, activation, or ControlR's open-source license notices. The [Hide sponsorship info](#hide-sponsorship-info) switch adds a ControlR entry to the third-party licenses list and removes no license notice.
- Support and documentation links, other than the entries the [Hide sponsorship info](#hide-sponsorship-info) switch removes.
- Login-page artwork, banners, or marketing content beyond the colors and the logo described above.
- Any behavioral change to ControlR. The build does not patch how ControlR works, it replaces strings, a stylesheet, and image files.
- Theme structure. You supply 14 colors into the existing dark and light themes. You cannot add themes or remove UI elements. [Custom CSS](#custom-css) is where styling beyond those 14 colors goes.
- Deployment topology or database choice. Those are deployment-time server configuration, not build inputs. The agent's server address, by contrast, is a build input, as [ControlR Server URL](#controlr-server-url) describes.

If a requirement on that list is a hard blocker for you, the portal will not solve it. Evaluate running the open-source ControlR server directly before committing sponsorship money to a customization that cannot happen.
