---
sidebar_position: 8
title: Connect To ControlR
---

## What The Build Gives You

A successful build produces a ControlR server image. It is a normal ControlR server, with your brand name, colors, publisher, and assets baked in. It behaves like any other ControlR server build. The difference is that it is published to a private container registry and only you can pull it.

## From Slot To Running Server

1. Configure a slot with your branding and settings. See [Manage A Build Slot](/docs/subscriber-portal/manage-a-build-slot).
2. Trigger a build and wait for it to succeed. See [Build Lifecycle](/docs/subscriber-portal/build-lifecycle) for what each status means.
3. On the slot's builds panel, copy the pull command from the **Image delivery** block. See [Getting Your Image](/docs/subscriber-portal/getting-your-image) for the full command, the credential behind it, and how to confirm the image you pulled.
4. Run that image as your ControlR server. You deploy a ControlR server image the same way you deploy any other ControlR server.

The built image is the server side of ControlR. Your agents connect to this server as they would to any ControlR server, using the address your server is actually reached at. That address is deployment-time server configuration. The **ControlR server URL** field on the slot is stored metadata and is not baked into the image. See [Slot Configuration Reference](/docs/subscriber-portal/slot-configuration#controlr-server-url).

## Where To Go For Server Setup

The portal stops at producing the image. Installing, configuring, and operating a ControlR server is covered in the ControlR docs.

- [Installation](/docs/installation), for deploying a ControlR server.
- [Docker Setup](/docs/admin/docker-setup), for running the server in Docker.
- [Configuration](/docs/configuration), for server settings once it is running.

The pull command gives you the image reference. Everything you do after you pull it is ordinary ControlR setup.
