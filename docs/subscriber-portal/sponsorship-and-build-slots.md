---
sidebar_position: 2
title: Sponsorship And Build Slots
---

## How Sponsorship Maps To Slots

Your monthly sponsorship level decides how many build slots you can use. A build slot is a configurable workspace that holds your branding and settings for one custom ControlR build.

The rules are:

- Custom builds unlock at **$100 per month**. Below that amount you have no build slots.
- At **$100 per month** you get **2 build slots**.
- Each additional **$100 per month** adds **1 more slot**.
- Sponsorship-earned slots are capped at **10**. The cap is reached at **$900 per month**, since $900 per month already earns 10 slots.

The table shows the count at common levels.

| Monthly sponsorship | Build slots |
|---------------------|-------------|
| Under $100 | 0 |
| $100 | 2 |
| $200 | 3 |
| $300 | 4 |
| $400 | 5 |
| $500 | 6 |
| $600 | 7 |
| $700 | 8 |
| $800 | 9 |
| $900 or more | 10 |

## Complimentary Slots

A portal operator can grant you complimentary slots on top of what your sponsorship earns. Complimentary slots add to your sponsorship-earned slots and are not limited by the 10-slot sponsorship cap. The dashboard counts them in your total.

## What A Slot Holds

A slot holds the configuration that turns into your branded ControlR image. That includes:

- A brand name and publisher shown in the built app.
- The ControlR version to build and the server runtime to target.
- The server URL your agents and clients use.
- Theme colors for the dark and light themes.
- Branded image assets such as an app icon, favicon, and logo.

You set these on the slot page. See [Manage A Build Slot](/docs/subscriber-portal/manage-a-build-slot).

## What A Slot Produces

When you trigger a build for a slot, the portal produces a ControlR server image that carries that slot's branding and settings. The image is published to a private container registry. The slot page shows the image and a command to pull it. See [Connect To ControlR](/docs/subscriber-portal/connect-to-controlr) for how the image fits into running ControlR.

## Slot States On The Dashboard

Each slot on your dashboard carries one of three states.

- **Locked**, where your sponsorship has not unlocked that slot number.
- **Available**, where the slot is unlocked but you have not configured it yet.
- **Configured**, where the slot is set up and ready to build.

## Syncing Sponsorship Data

The portal reads your sponsorship from GitHub rather than charging you directly. The dashboard has a **Sponsor sync** card that shows when your data last synced. Select **Sync now** to refresh it. Syncs are rate limited, so the card shows a cooldown countdown until the next manual sync is allowed.
