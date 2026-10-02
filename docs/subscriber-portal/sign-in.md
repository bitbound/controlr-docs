---
sidebar_position: 1
title: Sign In
---

## Signing In

The portal has its own accounts. There is no separate registration. You sign in with GitHub, and the portal creates your account from your GitHub identity the first time.

1. Open [https://portal.controlr.app](https://portal.controlr.app).
2. Select **Sign in with GitHub**. If you are already signed in, the landing page shows **Open dashboard** instead.
3. GitHub asks you to authorize the portal. Approve the request.

The portal sends you back to the dashboard after GitHub approves the sign-in. If you started from a page that needs a session, you go back to that page instead.

## Who Is Allowed In

The portal admits logins under one of two modes: open mode, where any GitHub account can sign in, and allowlist mode, where only logins on the portal's allowlist get in. A new portal starts in allowlist mode, so expect to be invited by a portal administrator unless you know the portal runs open. In allowlist mode a login that is not on the list is refused at the callback. You land back on the home page with the message "The portal is currently invite-only. You must be invited by an administrator." Logins configured as portal administrators skip that check, and they also skip the maintenance-mode notice. If your login is taken off the allowlist while your session is open, the next request signs you out and returns you to the home page.

## What The Portal Reads From GitHub

The first time you reach the dashboard, the portal shows a dialog titled **How your GitHub permissions are used**. It explains what the portal reads from your GitHub account and why. Select **Got it** to acknowledge it. The acknowledgment is required, so there is no other way to close the dialog. Clicking outside it does not dismiss it, and the Escape key does nothing. The portal records the acknowledgment, so the dialog does not return. It also states that the portal never writes to your GitHub account and cannot read your private repositories.

The portal reads your profile, your email, your organization memberships, and your sponsorship status. It uses these to identify you, match you to your sponsorship, and discover any sponsoring organizations you belong to.

For build notifications to reach you, your GitHub profile needs a public or primary email address, which is the only address the portal sees. If none is available, the email row in the permissions dialog tells you to add one. You can change this in your GitHub profile settings.

## Personal And Organization Contexts

Your GitHub login is how you sign in. The account context is the sponsor whose benefits you are viewing. They are kept separate.

- In a personal context, you manage your own sponsor account.
- In an organization context, you manage a sponsoring organization's account.

You can only manage an organization you have access to. GitHub organization admins (the `admin` role on the GitHub membership) get access automatically. Everyone else needs an explicit grant from an admin. See [Organization Access](/docs/subscriber-portal/organization-access) for how access is granted and how to switch contexts.

The account card on the dashboard says where you stand. It tells you when your GitHub account belongs to no organizations, and it names the organizations you do belong to that have not granted this account access.

## When There Is No Sponsorship Yet

Signing in always leaves you in a personal context. The portal creates it the first time the dashboard loads, whether or not anything sponsors the account. With no sponsorship recorded, the dashboard shows a warning that reads "Custom builds require at least $100/month in sponsorship. You start with 2 slots and earn 1 more for each additional $100/month." The build-slot list says "No custom build slots are currently unlocked." A sponsorship is what raises the slot count above zero, at $100 a month at least, from you or from an organization you manage.

## If Your GitHub Access Expires

The portal stores your GitHub authorization in its session and never refreshes it in the background. When that authorization expires or you revoke the portal's GitHub access, sponsorship and organization checks stop working. The dashboard then shows the banner "Your GitHub authorization is no longer valid. Sponsorship and organization checks are paused until you sign in again." Select **Sign in with GitHub** in the banner. That runs a fresh sign-in and restores the checks.
