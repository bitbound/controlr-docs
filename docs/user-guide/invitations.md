---
sidebar_position: 11
title: Invitations
---

## Overview

The Invitations page at `/invite` invites new users into your tenant. You need the `tenant.users.write` permission to send invitations.

## Inviting Users

1. Enter the user's email address
2. Click **Send Invitation**
3. An invitation link is generated and sent to the user's email

## Managing Invitations

The invitations page shows all pending invitations with:

| Column | Description |
|--------|-------------|
| **Email** | Email address the invitation was sent to |
| **Status** | Pending, Accepted, or Expired |
| **Created** | When the invitation was created |
| **Actions** | Delete or resend invitation |

| Action | Description |
|--------|-------------|
| **Search** | Filter invitations by email address |
| **Delete** | Cancel a pending invitation |
| **Resend** | Resend the invitation email |

## Accepting an Invitation

A user who receives an invitation email:

1. Clicks the invitation link.
2. Lands on the invitation page (`/invite-confirmation`).
3. Enters their email and chooses a password.
4. Joins the tenant and is redirected to the login page.

## Next

- **[Permissions](/docs/user-guide/permissions)**: Manage permissions and access
- **[Tenant Settings](/docs/user-guide/tenant-settings)**: Tenant-wide configuration
