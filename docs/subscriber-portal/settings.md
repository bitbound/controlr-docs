---
sidebar_position: 11
title: Portal Settings
---

**Settings** in the sidebar holds the options that apply to your account rather than to one slot. The page has two cards: **Preview builds** and **Redeem a promo code**.

## Preview Builds

The version picker on a slot's configuration form lists the release tags of the ControlR repository. Preview tags are prerelease builds with a `-dev` suffix, such as `v0.28.3.0-dev`. They are hidden from the picker by default.

Toggle **Enable preview builds** to show them. The page confirms with "Preview builds will now appear in the version picker." Turning the setting back off hides the tags again with "Preview builds are now hidden from the version picker." A slot already pinned to a preview tag is unaffected by turning the setting off. Its next build still uses the tag it is pinned to.

The newest-version comparison on the dashboard follows the same setting, so with the toggle off it compares against the latest stable release.

The portal labels the toggle "Preview builds" but the tags still read `-dev`. Preview builds may be unstable. Enable the setting only when you want to test unreleased changes.

## Redeem A Promo Code

A promo code is a one-time code that grants complimentary build slots. Codes are issued by the portal maintainers, typically as email or event giveaways with a code like `7kq4-m9xz-2bfd-8snf`.

1. Switch to the account that should receive the slots first. A code redeems into the currently active account context, so redeem into your organization's context if the slots are for the organization. See [Organization Access](/docs/subscriber-portal/organization-access) for switching contexts.
2. Open **Settings**.
3. Enter the code in the **Promo code** field. Case does not matter and spaces inside the code are ignored. Keep the dashes.
4. Select **Redeem**.

A success message reads "Added N complimentary slot(s) for "LABEL" · expires `<date>`" with the grant's expiry date, or ends with "no expiration" for a permanent grant. The new slots appear on the dashboard immediately. The redemption then locks the code for your account. Redeeming the same code again returns "This code has already been redeemed for this account."

Rules that matter before you redeem:

- The granted slots are complimentary slots that add to your sponsorship-earned count. See [Sponsorship And Build Slots](/docs/subscriber-portal/sponsorship-and-build-slots#complimentary-slots).
- The grant's duration is counted from the day you redeem, not from the day the code was issued. A 60-day code redeemed today expires about 60 days from today.
- The code itself can carry a last day to redeem. A code past that date answers "This code has expired." A revoked code answers "This code is no longer available." A mistyped or unknown code answers "This code was not recognized."
- Complimentary slots keep an account eligible for registry access while the grant is unexpired, even if the sponsorship lapses. See [Sponsorship Changes And Lapse](/docs/subscriber-portal/sponsorship-changes-and-lapse).

If you arrive at the portal from a link that carries the code, Settings opens with the code already filled in, and a sign-in round trip keeps it. Select **Redeem** to finish.
