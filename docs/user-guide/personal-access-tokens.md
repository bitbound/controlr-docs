---
sidebar_position: 8
title: Personal Access Tokens
---

## Overview

Personal Access Tokens (PATs) let you call the ControlR API as your user account without sending a username and password on every request. Send the token in the `x-personal-token` header.

Each token is one of two permission modes.

| Mode | Wire value | What the token can do |
|------|-----------|------------------------|
| **Restricted (scoped)** | `Restricted` | Only what its own permission grants allow, and never more than you can do. A token with no grants does nothing. |
| **Inherit Owner (full access)** | `InheritOwner` | Everything your account can do, evaluated from your own effective permissions. It carries no grants of its own. |

New tokens default to `Restricted`. A token can carry an optional expiry. See [Expiry](#expiry).

## How Permissions Are Evaluated

**Restricted** tokens are checked twice. A request must pass your own current effective permissions, then it must be covered by one of the token's grants. It is an intersection, not either one alone. The same intersection limits which devices the token can list.

A grant you no longer hold stops working immediately, because your permission is checked first. A background sweep removes those surplus grant rows within about 15 minutes and records each removal in the authorization log.

**Inherit Owner** tokens skip the second check and use your permissions directly, so revoking your own permissions takes that token with them.

Two more rules apply to any token-authenticated request.

- A token cannot mint a full-access token. Only a full-identity session, meaning a browser sign-in, a bearer token, or a service-account credential, can create an `InheritOwner` token. A token can only create `Restricted` tokens, and the requested grants are validated against the owner first.
- If your account is locked out, every token that belongs to it is refused while the lockout lasts.

There is no step-up challenge for token-authenticated requests. No endpoint asks a token for a password or a passkey, so a token reaches whatever your account reaches with no interactive confirmation.

Server decommission mode is a server-wide teardown switch driven by configuration. It affects connecting agents, not token authentication.

## Accessing PATs

1. Open **Access Tokens** in the sidebar. The address is `/personal-access-tokens` and the page heading is **Personal Access Tokens**.
2. Managing your own tokens needs two tenant-scoped permissions: `personal-access-token.self.read` to list them and `personal-access-token.self.write` to create, rename, or delete them.
3. Every interactive user account is seeded with both. External and guest accounts are not. A tenant admin can add or remove either grant, which is why the sidebar entry is missing for some accounts.

Somebody else's tokens are managed through `GET`, `POST`, `PUT`, and `DELETE` on `/api/v1/users/{userId}/personal-access-tokens`, guarded by `personal-access-token.others.read` and `personal-access-token.others.write`. The web client has no screen for it.

## Creating a Token

1. Enter a name in the **Token Name** field, for example `CI/CD Pipeline` or `Backup Script`. Names run to 256 characters.
2. Pick **Permission Mode**: **Restricted (scoped)** or **Inherit Owner (full access)**.
3. Choose **Create PAT**. Pressing Enter in the name field does the same thing.
4. A dialog titled **Personal Access Token Created** shows the value under the label **Personal Access Token**. Copy it now. This is the only time it is displayed.
5. A new **Restricted (scoped)** token has no grants, so it cannot authenticate a successful call yet. For a **Restricted (scoped)** token the permissions dialog opens right after the secret dialog closes. A new **Inherit Owner (full access)** token works immediately and opens no permissions dialog.

The secret is stored as a hash, so a lost secret means creating a new token.

### Create Request Fields

`POST /api/v1/personal-access-tokens?tenantId=<tenant-id>`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `name` | string | yes | none | 1 to 256 characters. Friendly label only. |
| `permissionMode` | string enum | no | `Restricted` | `Restricted` or `InheritOwner`. |
| `scopes` | array of scope objects | no | none | Grants to attach at creation. Not valid with `InheritOwner`, which rejects a non-empty array. |
| `expiresAt` | date-time | no | none | Optional expiry as an ISO-8601 timestamp. Leave it out (or send null) for a token that never expires. A request that arrives after this time fails authentication. |

Each entry in `scopes` is:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `permissionName` | string | yes | 1 to 150 characters, for example `device.read`. |
| `scopeKind` | integer | yes | Numeric enum: `0` Unknown, `1` Server, `2` Tenant, `3` CustomerTenant, `4` DeviceGroup, `5` Device, `6` UserGroup. `0` is always rejected. |
| `scopeId` | UUID or null | nullable | The generated schema lists it as required, so send the property. Send null where it does not apply. Server scope ignores it. Tenant scope accepts null or your own tenant id. Device, DeviceGroup, CustomerTenant, and UserGroup scope need the id of a resource that exists in your tenant. |

Creation validates each grant before anything is written. The target has to exist in your tenant, and you have to already hold that permission at that scope yourself. A grant of a tenant-level permission at Server scope is refused for any credential, since server-wide reach belongs to server service accounts. Each failed check answers 400 with the reason.

The web page never sends `scopes`. It creates a token with a name, a mode, and an optional expiry only. Through the browser, grants are added afterwards in the assignment panel.

```bash
curl -X POST "https://your-server.example.com/api/v1/personal-access-tokens?tenantId=3f2a1c94-7c45-4a1e-9d0b-6f1f2a3b4c5d" \
  -H "x-personal-token: <tokenId>:<secret>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Backup Script","permissionMode":"Restricted","scopes":[{"permissionName":"device.read","scopeKind":5,"scopeId":"b1a2c3d4-0000-4000-8000-000000000001"}]}'
```

### Create Response

The response is 201 Created. Property names are camelCase. `permissionMode` is serialized as a string, while `scopeKind` in a request is numeric.

```json
{
  "personalAccessToken": {
    "id": "6b0f4c1e-2a3d-4e5f-8a1b-2c3d4e5f6a7b",
    "name": "Backup Script",
    "createdAt": "2026-09-21T14:05:12.348+00:00",
    "lastUsed": null,
    "permissionCount": 1,
    "permissionMode": "Restricted",
    "expiresAt": null,
    "revokedAt": null
  },
  "plainTextToken": "1E4C0F6B3D2A5F4E8A1B2C3D4E5F6A7B:Kq7..."
}
```

| Field | Meaning |
|-------|---------|
| `personalAccessToken.id` | The token id. It is the first half of the value you send in the header. |
| `personalAccessToken.name` | The name you set. |
| `personalAccessToken.createdAt` | Creation timestamp. |
| `personalAccessToken.lastUsed` | Timestamp of the last successful authentication, or `null`. The grid shows `Never` for `null`. |
| `personalAccessToken.permissionCount` | How many distinct permission names are currently granted to the token. Zero for a token created with no grants, which includes every **Inherit Owner (full access)** token, since grants are not what that mode is checked against. |
| `personalAccessToken.permissionMode` | `Restricted` or `InheritOwner`. |
| `personalAccessToken.expiresAt` | The expiry timestamp, or `null` for a token that never expires. The grid's **Expires** column shows `Never` for `null`. |
| `personalAccessToken.revokedAt` | The moment the token was revoked, or `null` while it is live. The **Status** column shows a **Revoked** chip when this is set. |
| `plainTextToken` | The complete header value. Returned once, never stored in recoverable form. |

### Expiry

A token may carry an optional expiry. The create request accepts an `expiresAt` timestamp; leave it out and the token never expires. When an expiry is set, every request that arrives after it fails authentication, and the **Status** column flips to **Expired**. A token created with no expiry stays valid until you delete or revoke it.

Only these stop a token: you delete or revoke it, its expiry passes, its grants stop covering the call, your account is locked out, or too many failed attempts trip the rate limit for a few minutes.

## Token Format

The header value is two parts separated by a colon:

```text
{tokenId}:{secret}
```

`tokenId` is the token's 16 bytes rendered as 32 uppercase hexadecimal characters. It is not the dashed form of the GUID, so do not build it by hand. Take the value from `plainTextToken`. `secret` is a 64-byte random value encoded as 86 URL-safe base64 characters, and it is verified against a stored hash. That alphabet contains hyphens and underscores but never a colon, so the first colon is the only separator the server needs.

## Using a PAT

```bash
curl https://your-server.example.com/api/v1/devices \
  -H "x-personal-token: <tokenId>:<secret>"
```

```python
import requests

headers = {
    "x-personal-token": "1E4C0F6B3D2A5F4E8A1B2C3D4E5F6A7B:Kq7..."
}
response = requests.get("https://your-server.example.com/api/v1/devices", headers=headers)
print(response.json())
```

Some versioned endpoints also take a `tenantId` query parameter and reject a request whose value does not match your tenant. The token endpoints above are among them. Endpoints that derive the tenant from your credentials, such as the device list above, do not need it.

For a typed .NET client, use the [`ControlR.ApiClient`](https://www.nuget.org/packages/ControlR.ApiClient) NuGet package:

```csharp
using ControlR.ApiClient;

ControlrApiClientBuilder.Initialize(options =>
{
    options.BaseUrl = new Uri("https://your-server.example.com");
    options.PersonalAccessToken = "1E4C0F6B3D2A5F4E8A1B2C3D4E5F6A7B:Kq7...";
});
var client = ControlrApiClientBuilder.GetClient();

await foreach (var device in client.V1.Devices.GetAllDevices())
{
    Console.WriteLine($"{device.Name} ({device.Id})");
}
```

See the [NuGet Packages](/docs/api-reference/nuget-packages) page for a complete walkthrough of dependency injection and the static builder.

## Managing Tokens

The grid lists your tokens with the columns **Name**, **Status**, **Mode**, **Created**, **Last Used**, **Permissions**, **Expires**, and **Actions**. **Status** shows **Active**, **Expired**, or **Revoked**. A refresh button sits in the grid toolbar. Everything except creating a token happens in the **Actions** menu on each row.

| Action | Endpoint | What happens |
|--------|----------|--------------|
| List | Page load, then `GET /api/v1/personal-access-tokens?tenantId=<tenant-id>` | Newest first. |
| Rename | **Rename** in the row menu | A dialog titled **Rename Personal Access Token** with a **New Name** field, sent as `PUT /api/v1/personal-access-tokens/{id}?tenantId=<tenant-id>`. The secret does not change, so nothing needs updating in your tooling. |
| Edit Permissions | **Edit Permissions** in the row menu | Opens the assignment panel titled `Permissions: <name>`. See the note below. |
| Revoke | **Revoke** in the row menu | `POST /api/v1/personal-access-tokens/{id}/revoke?tenantId=<tenant-id>`. Revokes the token immediately. The row stays, now showing a **Revoked** status, so it remains visible for audit. The menu item is hidden once a token is already revoked. |
| Delete | **Delete** in the row menu | A **Confirm Delete** dialog asks first, then `DELETE /api/v1/personal-access-tokens/{id}?tenantId=<tenant-id>` answers 204. |

The assignment panel is read-only for you unless you also hold `tenant.permissions.write` or `server.permissions.write`. Without one of those, the panel shows the token's grants but hides **New Assignment**, **Delete Selected**, and the presets block. A plain user who needs a scoped token has to ask an admin for the grants, then create the token themselves, since grant assignment and token creation are separate permissions.

Revoke and Delete are different. **Revoke** marks the token revoked at once and keeps its row for audit; the next request using that value fails authentication. **Delete** removes the token row and its grant rows in the same transaction. Neither can be undone.

There is no limit on how many tokens one user can create.

## Rate Limiting

Failed token authentications are counted for five minutes. The limit is five failures, tracked on two independent axes: the requesting source IP, and the token id in the header. Either axis reaching five blocks that axis until the window passes. A successful authentication clears both counters. The two axes are kept separate on purpose, so rotating token ids from one address cannot buy extra attempts. A header whose prefix is not a parseable id is counted against one shared bucket rather than its own.

The counters live in the server's memory, so they reset when the server restarts and are not shared between instances of a multi-instance deployment.

## Security Best Practices

- **Store tokens securely.** Never commit them to source control.
- **Use descriptive names.** It makes identifying and revoking a specific token possible later.
- **Rotate tokens regularly.** Create a new token, move the workload, then delete the old one. There is no rotation endpoint.
- **Use minimum permissions.** Prefer a **Restricted (scoped)** token holding only the grants the workload needs. An **Inherit Owner (full access)** token gains anything you are granted later, without asking you.

## Next

- **[Authentication Guide](/docs/authentication-guide)**: All authentication methods
- **[API Overview](/docs/api/overview)**: API structure and conventions
