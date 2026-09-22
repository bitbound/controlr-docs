---
sidebar_position: 2
title: Sponsorship And Build Slots
---

## How Sponsorship Maps To Slots

Your monthly sponsorship level decides how many build slots you can use. A build slot is a configurable workspace that holds your branding and settings for one custom ControlR build.

The rules are:

- Custom builds become available at **$100 per month**. Below that amount you have no build slots.
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
- A ControlR server URL stored on the slot. See [Slot Configuration Reference](/docs/subscriber-portal/slot-configuration#controlr-server-url) for what this field does.
- Theme colors for the dark and light themes.
- Branded image assets such as an app icon, favicon, and logo.

You set these on the slot page. See [Manage A Build Slot](/docs/subscriber-portal/manage-a-build-slot).

## What A Slot Produces

When you trigger a build for a slot, the portal produces a ControlR server image that carries that slot's branding and settings. The image is published to a private container registry. The slot page shows the image and a command to pull it. See [Connect To ControlR](/docs/subscriber-portal/connect-to-controlr) for how the image fits into running ControlR.

## Slots On The Dashboard

The dashboard shows a card only for slots that your entitlement grants and that you have access to. Slots beyond your entitlement are not listed at all, so the number of cards you see is the number of slots you can actually use. If your entitlement is zero, no cards appear and the dashboard shows a warning instead.

The dashboard's slot metric card also carries a caption reading "X of N slots are currently configured". Do not rely on that count. In the current portal version, saving a slot's configuration does not raise it, and it can stay at zero for fully configured slots. The slot cards and their status chips are what reflect reality.

## Syncing Sponsorship Data

The portal reads your sponsorship from GitHub rather than charging you directly. The dashboard has a **Sponsor sync** card that shows when your data last synced. Select **Sync now** to refresh it. Manual syncs are limited to about one per minute, so the card shows a cooldown countdown until the next manual sync is allowed. Sponsorship data is also refreshed automatically when it is more than five minutes old.

When your sponsorship level changes or your sponsorship lapses, your slots change with it. Read [Sponsorship Changes And Lapse](/docs/subscriber-portal/sponsorship-changes-and-lapse) before you let a sponsorship go quiet. Registry deletion on lapse is permanent and unrecoverable without a rebuild.
