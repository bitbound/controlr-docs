---
sidebar_position: 11
title: Invitations
---

## Overview

The Invite page at `/invite` invites new users into your tenant. You need the `tenant.users.write` permission to open the page and create or delete invitations.

ControlR does not send invitation emails. Creating an invite immediately creates the user account and generates an invite link. You copy the link from the page and deliver it yourself, by email or any other channel. The account is created with a random password the invitee never sees, so they cannot sign in until they accept the invite and set their own password.

## Inviting Users

1. On the Invite page, type the email address into the **Invite New User** field and press Enter, or click the person-add icon at the end of the field.
2. The server creates the user account in your tenant and an invite, then adds a row to the grid. A snackbar reports "Invite created".
3. In the new row, click the copy icon in the **Invite URL** column. The link is copied to your clipboard and a snackbar reports "Copied to clipboard".
4. Send the link to the invitee yourself. ControlR sends no email.

The invite link has the shape `https://your-server/invite-confirmation/{activation-code}`. The activation code is 86 characters. It is 64 random bytes rendered as URL-safe base64 with the padding removed, the same construction used for a personal access token secret. Anyone who has the link and knows the invited email address can set the account password, so share the link only with the intended person.

Creation is rejected in these cases:

- The email already has a pending invite.
- A user with that email already exists in the database.
- The instance requires confirmed email addresses while email sending is disabled.

## The Invitation Grid

The grid lists the invitations that have not been accepted or deleted yet.

| Column | Description |
|--------|-------------|
| **Invitee Email** | Email address the invitation was created for |
| **Created At** | When the invitation was created |
| **Invite URL** | Read-only field labeled "Copy to share URL". The text is masked. The copy icon copies the full link to the clipboard |
| **Delete Invite** | Trash icon that deletes the invitation |

Toolbar controls:

- **Search**: filters the grid rows whose values contain the search text, matched case-insensitively.
- **Refresh**: reloads the invitation list from the server.

There is no status column. An accepted invitation is removed from the list, so every listed row is still pending. There is no resend action. To re-issue a link, delete the invitation and create a new one. Deletion removes the user account that was created for the invite, which the confirmation dialog warns about. A user who already accepted cannot be deleted this way, because accepting removes the invite row.

Deleting an invitation has no effect if the invitee never received the link. The created account cannot log in without a password set through acceptance.

## Accepting an Invitation

The invitee must be logged out. The confirmation page refuses the acceptance form while a session is active and shows "You must be logged out to accept an invitation."

1. Open the invite link. The confirmation page is served at `/invite-confirmation/{activation-code}`.
2. Enter the invited email address in the **Your Email Address** field. It must match the address on the invite.
3. Choose a password in the **Your New Password** field and repeat it in **Confirm Password**. The form requires at least 8 characters. The server also rejects passwords that fail the account policy: at least 8 characters with an uppercase letter, a lowercase letter, and a digit.
4. Click **Submit**, or press Enter.
5. On success the page shows "Tenant Joined Successfully" and "You can now log in with your new password." The **Log In** button goes to `/Account/Login`. The page does not redirect on its own.

The invite link does not expire. It stays valid until it is accepted once or deleted. Reusing an accepted link reports "Invitation not found", as does a link whose activation code does not match the entered email address.

## What the User Gets

The invited account is created in the inviting tenant and its email address is marked confirmed at creation. Acceptance sets the chosen password and seeds the account with the Self Service preset, which grants only `personal-access-token.self.read` and `personal-access-token.self.write`. The invitee sees no devices and has no administrative permissions until someone grants more access.

## API

The V1 endpoints are `/api/v1/invites` with a required `tenantId` query parameter. `POST` and `DELETE` require `tenant.users.write`. `GET` requires `tenant.users.read`, but the invite URL in the response includes the activation code only when the calling credential also holds `tenant.users.write`.

## Next

- **[Permissions](/docs/user-guide/permissions)**: Manage permissions and access
- **[Tenant Settings](/docs/user-guide/tenant-settings)**: Tenant-wide configuration
