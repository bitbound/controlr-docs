---
sidebar_position: 0
title: Overview
---

## What It Is

The ControlR Portal is the sponsor portal for ControlR. It is a web app where GitHub sponsors manage the custom-build benefits that come with their sponsorship. You sign in with the same GitHub account you sponsor with, review your current sponsorship, and create branded, customized ControlR builds. The browser tab and the header both read **ControlR Portal**, and that is the name the portal uses in the email it sends you.

The portal is separate from the ControlR server you run. ControlR is the remote access product. The portal produces a ControlR server build that carries your branding, as a container image or a downloadable archive depending on the slot. You run that build as your ControlR server.

Sponsors reach the portal at [https://portal.controlr.app](https://portal.controlr.app). The landing page is public and explains what sponsorship includes. Everything past it, including your sponsorship, slots, and builds, requires sign-in.

## Who It Is For

The portal is for sponsors. Two kinds of sponsor account are supported.

- A personal sponsor, where your own GitHub account funds the sponsorship and you manage your own benefits.
- An organization sponsor, where a GitHub organization funds the sponsorship. Organization admins get portal access automatically. Delegated members can be given access to specific build slots. See [Organization Access](/docs/subscriber-portal/organization-access).

If you sponsor as an individual, you work in a personal context. If you belong to a sponsoring organization, you can switch between your personal context and the organization context.

## What You Can Do

Once signed in you can:

- Review your sponsorship state, tier, and the number of build slots you have.
- Configure build slots with your branding and settings.
- Trigger a custom ControlR build for a slot and watch its progress.
- Get the result, as a pull command for a container image or a download for a server archive.
- Receive an email when a build you started finishes.
- In an organization context, manage which members can reach the portal and what they can do.

## Where To Go Next

New to the portal? [Sign In With GitHub](/docs/subscriber-portal/sign-in) walks through your first login. Then read [Sponsorship And Build Slots](/docs/subscriber-portal/sponsorship-and-build-slots) to understand what your sponsorship includes, and skim [Sponsorship Changes And Lapse](/docs/subscriber-portal/sponsorship-changes-and-lapse) so you know what a lapse destroys.

The working reference pages are [Manage A Build Slot](/docs/subscriber-portal/manage-a-build-slot) for the slot page itself, [Slot Configuration Reference](/docs/subscriber-portal/slot-configuration) for every field, asset rule, and what branding actually reaches the product, [Build Lifecycle](/docs/subscriber-portal/build-lifecycle) for statuses, cancellation, and history retention, and [Getting Your Image](/docs/subscriber-portal/getting-your-image) for the pull command, the archive download, and registry credentials. Once the built server is running, [Connect To ControlR](/docs/subscriber-portal/connect-to-controlr) hands you off to normal server setup.
