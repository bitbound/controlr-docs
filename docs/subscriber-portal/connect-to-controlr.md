---
sidebar_position: 8
title: Connect To ControlR
---

## What The Build Gives You

A successful build produces a ControlR server. It carries your brand name, colors, publisher, and assets baked in, and behaves like any other ControlR server build. The delivery format on the slot decides the shape it arrives in. A **Docker image** slot publishes a container image to a private registry that only you can pull. A **ZIP download** slot stores a self-contained server archive you download from the portal instead. See [Delivery Format](/docs/subscriber-portal/slot-configuration#delivery-format).

## From Slot To Running Server

1. Configure a slot with your branding and settings. See [Manage A Build Slot](/docs/subscriber-portal/manage-a-build-slot).
2. Trigger a build and wait for it to succeed. See [Build Lifecycle](/docs/subscriber-portal/build-lifecycle) for what each status means.
3. Get the built server off the builds panel. A **Docker image** slot shows a pull command in the **Image delivery** block. A **ZIP download** slot shows a **Download server** button under a **ZIP delivery** heading. Either way, see [Getting Your Image](/docs/subscriber-portal/getting-your-image).
4. Run that server as your ControlR server. The built server is the server side of ControlR. Your agents connect to it as they would to any ControlR server, using the address your server is actually reached at. That address is deployment-time server configuration. The **ControlR server URL** field on the slot is shipped to the builder in the customization payload, but the portal does not bake it into the image and whether a build uses it is up to the pipeline. See [Slot Configuration Reference](/docs/subscriber-portal/slot-configuration#controlr-server-url).

## Where To Go For Server Setup

The portal stops at producing the build. Installing, configuring, and operating a ControlR server is covered in the ControlR docs.

- [Installation](/docs/installation), for deploying a ControlR server.
- [Docker Setup](/docs/admin/docker-setup), for running the server in Docker. This matches a **Docker image** slot.
- [Native Installation](/docs/admin/native-installation), for running an unpacked self-contained archive under systemd. This matches a **ZIP download** slot on a Linux AMD64 host. Note the portal hands you your own branded archive, so do not expect the public release file names that guide uses.
- [Configuration](/docs/configuration), for server settings once it is running.

This site has no guide for running the archive on Windows. A **win-x64** ZIP build only exists on a **ZIP download** slot, and you operate it with your own Windows tooling. The portal's job ends once it hands you the archive.

There is also no ARM walkthrough. A slot built for `linux-arm64` runs on ARM hardware and the pipeline builds it, but every guide above assumes an AMD64 host. A **Docker image** slot built for ARM gives you a `linux/arm64` image you run with your own Docker setup. A **ZIP download** slot built for ARM gives you an unpacked archive you run with your own service unit. The [Native Installation](/docs/admin/native-installation) guide's note that ARM64 is not a published target is about the public release downloads, not about your own build.
