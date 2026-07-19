---
sidebar_position: 8
title: Personal Access Tokens
---

## Overview

Personal Access Tokens (PATs) let you authenticate against the ControlR API as your user account without sending a username and password on every request. Each PAT acts with your roles, tenant, and tag-based device access.

## Accessing PATs

1. Navigate to **Access Tokens** (`/personal-access-tokens`)
2. Any authenticated user can manage their own tokens

## Creating a Token

1. Enter a friendly name for the token (e.g., "CI/CD Pipeline", "Backup Script")
2. Click **Create PAT**
3. **Copy the token immediately**: it will never be shown again

## Using a PAT

Include your PAT in the `x-personal-token` header of API requests:

```bash
curl https://your-server/api/devices \
  -H "x-personal-token: <tokenId>:<secret>"
```

The token format is `{tokenId}:{secret}`. Include both parts separated by a colon.

### Using in Code

```python
import requests

headers = {
    "x-personal-token": "abc123def456:secret-key-here"
}
response = requests.get("https://your-server/api/devices", headers=headers)
print(response.json())
```

For a typed .NET client, use the [`ControlR.ApiClient`](https://www.nuget.org/packages/ControlR.ApiClient) NuGet package:

```csharp
using ControlR.ApiClient;

ControlrApiClientBuilder.Initialize(options =>
{
    options.BaseUrl = new Uri("https://your-server.example.com");
    options.PersonalAccessToken = "abc123def456:secret-key-here";
});
var client = ControlrApiClientBuilder.GetClient();

await foreach (var device in client.V1.Devices.GetAllDevices())
{
    Console.WriteLine($"{device.Name} ({device.Id})");
}
```

See the [NuGet Packages](/docs/api-reference/nuget-packages) page for a complete walkthrough of dependency injection and the static builder.

## Managing Tokens

| Action | Description |
|--------|-------------|
| **List** | View all your active tokens |
| **Rename** | Update the friendly name of a token |
| **Delete** | Revoke a token: it will no longer work for authentication |

## Rate Limiting

PAT authentication failures are rate-limited to **5 attempts per 5 minutes** per token prefix + IP combination. This helps prevent brute-force attacks.

## Security Best Practices

- **Store tokens securely**: never commit them to source control
- **Use descriptive names**: makes it easy to identify and revoke tokens
- **Rotate tokens regularly**: delete and recreate tokens periodically
- **Use minimum permissions**: create tokens with the least privilege needed

## Next

- **[Authentication Guide](/docs/authentication-guide)**: All authentication methods
- **[API Overview](/docs/api/overview)**: API structure and conventions
