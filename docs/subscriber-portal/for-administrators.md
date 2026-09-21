---
sidebar_position: 11
title: For Portal Administrators
---

This page is for portal operators, not sponsors. Sponsors can ignore it.

Portal administrators are a small set of accounts that run the portal itself. Admin-only pages appear under an **Admin** section in the navigation and are reachable only by admin accounts.

## Operations

The Operations page gives administrators a view across all sponsors, slots, and builds, so they can see build activity and investigate problems that a sponsor reports. It is an administrative overview rather than something a sponsor uses.

## Notification Preferences

The Settings page lets an administrator choose which emails their own admin account receives. The preferences apply only to that admin account. There is a toggle for build-completed notifications, a toggle for build-failed notifications, and a toggle for workflow-failure alerts, plus a **Save preferences** button.

Admin failure alerts are only sent to configured administrators whose own preferences are enabled. This is separate from sponsor build emails. Sponsors always receive build outcome emails on their own account and have no preferences to set. See [Notifications](/docs/subscriber-portal/notifications).

## SMTP Test

Administrators can send themselves a test email to confirm the portal's mail delivery is configured and working. It delivers a simple message through the configured mail relay to a recipient the administrator names.

## What Is Out Of Scope Here

How to deploy the portal, its environment variables, its database, and its mail relay are operator tasks that are not part of the sponsor guides. This page only covers the admin screens a sponsor never sees.
