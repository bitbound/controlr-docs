---
sidebar_position: 4
title: Organization Access
---

## Two Sponsor Contexts

You sign in with your GitHub login. That login can lead to more than one sponsor account. The dashboard shows the account you are currently working in as the **Account context**.

- A personal context, where you manage your own sponsorship.
- One or more organization contexts, where you manage a sponsoring organization.

When you can manage more than one account, the dashboard shows an **Active account** selector. Choose the account and select **Switch**. The dashboard reloads to show that account's sponsorship and slots.

The dashboard tells you where you stand if you cannot manage an organization yet:

- If you belong to no GitHub organizations, it says so.
- If you belong to organizations but none of them grant this portal access, it says so too.

## How Organization Access Works

The portal separates the GitHub identity that signs in from the organization account whose benefits are managed. There are two ways to gain access to an organization context.

- Organization admins get access automatically when GitHub confirms their admin role. They have full access and their access is not editable from the portal.
- Delegated members are granted access by someone who manages users for that organization. Delegated access can be limited to specific slots and specific actions.

The portal revalidates organization access against GitHub over time. If your admin role goes away, the matching access is revoked automatically.

## Manage Who Has Access

In an organization context, open **Users** from the navigation. The portal shows this page when the active account is an organization and you have at least read access to its users. You can change access only if you also have User management write, described below.

The **Organization users** page has three sections: current access, pending invites, and audit history. To add someone, select **Grant access** and enter their GitHub username.

- A member of the organization can be granted access right away.
- Someone who is not a member gets a pending invite. They receive access after they join the organization.

To change or remove an existing grant, use **Edit access** or **Remove access** on that person's card. The same applies to a pending invite.

## Permissions You Can Grant

Grants come in two groups.

**Organization-wide permissions** apply across the organization:

- **User management read**, to open the Users page and see who has access.
- **User management write**, to manage portal access for other members. A member with this can open the Users page and grant, edit, and revoke access themselves.
- **Audit history read**, to view the record of access changes. Without it the audit history is hidden even if you can see the rest of the page.

**Slot permissions** apply to one build slot:

- **Read**, to view that slot's configuration and history.
- **Write**, to change the slot's configuration and assets. Write includes Read.
- **Execute**, to trigger builds for that slot.
- **Logs**, to view build logs.
- **Credentials**, to view the registry credentials and pull command.

When you assign Write you get Read automatically. The same rule applies for user-management Write over Read.

## If You Cannot Manage Users

If you can view the Users page but cannot change it, the page tells you that you can review grants and invites but cannot create or edit them. Ask someone in your organization who has **User management write** to make the change.
