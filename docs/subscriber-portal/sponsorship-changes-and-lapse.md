---
sidebar_position: 3
title: Sponsorship Changes And Lapse
---

## Why This Page Matters

Your build entitlement comes straight from your GitHub sponsorship. If the sponsorship changes, the portal follows it, including automated teardown of registry access when an account stops qualifying. That teardown deletes published images. Read this before cancelling or lowering a sponsorship, and share it with whoever owns the billing relationship in your organization.

## How The Slot Count Tracks Your Sponsorship

Your entitlement is computed from your current monthly sponsorship amount: nothing below $100, 2 slots at $100, one more slot per additional $100, capped at 10. The portal reads the amount from GitHub rather than holding its own billing relationship. The new count becomes visible the next time your sponsorship data syncs. The portal refreshes sponsorship data with a background sweep that runs on a schedule and whenever GitHub reports a change, and the dashboard's **Sponsor sync** card shows the last sync time. A complimentary slot grant, from a portal operator or from a redeemed promo code, adds to the count while the grant is unexpired.

## If Your Sponsorship Increases

New slot cards appear on the dashboard as soon as the synced count rises. A newly added slot starts empty. Configure it like any other slot. Nothing about your existing slots changes.

## If Your Sponsorship Decreases But Stays At Or Above $100

Slots numbered beyond your new entitlement lock. In order of what you see:

- The slot cards disappear from the dashboard. Only slots within the entitlement are listed.
- Opening a locked slot directly shows the warning "Slot N is locked for the current sponsorship entitlement." You can still view its configuration and history if you had read access. The form becomes read-only.
- Saving that slot's configuration and triggering builds for it fail with the same locked-slot error.
- Your saved configuration and uploaded assets on the locked slot are not deleted. Raise the sponsorship again and the slot returns with its contents intact.
- Images already built from those slots are not deleted by a downgrade alone. While your account still qualifies for registry access, which it does at $100 per month or more, or with an unexpired complimentary grant, your pull credential keeps working for every slot's image, including images built from slots that are now locked.

## If Your Sponsorship Lapses Entirely

An account is eligible for registry access while it has an active sponsorship at or above the custom-build level, or at least one unexpired complimentary slot grant. Below that, with no grant, the teardown runs:

1. The entitlement drops to zero slots as soon as the new sponsorship data syncs. Every slot locks. No new builds are possible.
2. The portal stops handing out pull credentials for the account. Where a pull command used to appear, you get an error saying registry pull credentials are no longer available for the account.
3. A background sweep that runs about every 30 minutes finds the ineligible account, disables its registry login token, deletes the account's entire image repository, and deletes the stored credential. This is a real deletion of your published images, not just an access cutoff. There is no archive.
4. A portal operator revoking a complimentary grant that pushed an account out of eligibility triggers the same teardown immediately rather than waiting for the sweep.

A downgrade from one qualifying level to another does not delete anything. Full lapse does. If images from your slots matter to you, pull them and mirror them to a registry you control before the sponsorship drops below the threshold.

## Recovering After A Lapse

Raising the sponsorship back to the required level, or getting a fresh complimentary grant, restores the entitlement and brings your slots back with their configurations and assets still in place. It does not restore images. If the sweep already ran, the repository is gone. When you next open a slot's pull command, the portal re-provisions and re-enables the login token automatically, but the build history now points at images that no longer exist. A pull will fail. Trigger a fresh build for each slot you need and use the new pull command. If the lapse was very recent and the sweep had not yet run, your previously copied command may still work, but treat that as luck rather than a plan.

## Watch The State, Not Your Memory Of It

Sponsorship state, slot counts, and entitlement all update on sync, not on the moment GitHub charges change. If you changed your sponsorship on GitHub and the dashboard has not caught up, check the **Sponsor sync** card's last synced time and give the next sweep a chance to run. Build history rows survive a lapse and survive a downgrade. They keep naming images that may already be deleted, so a row with `succeeded` on a lapsed account does not mean the image is pullable.
