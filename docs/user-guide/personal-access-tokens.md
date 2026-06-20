---
sidebar_position: 8
title: Personal Access Tokens
---

## Overview

Personal Access Tokens (PATs) allow you to authenticate with the ControlR API as your user account without using a username and password. They're ideal for scripts, automation, and programmatic access.

## Accessing PATs

1. Navigate to **Access Tokens** (`/personal-access-tokens`)
2. Any authenticated user can manage their own tokens

## Creating a Token

1. Enter a friendly name for the token (e.g., "CI/CD Pipeline", "Backup Script")
2. Click **Create PAT**
3. **Copy the token immediately** — it will never be shown again

## Using a PAT

Include your PAT in the `x-personal-token` header of API requests:

```bash
curl https://your-server/api/devices \
  -H "x-personal-token: <tokenId>:<secret>"
```

The token format is `{tokenId}:{secret}` — include both parts separated by a colon.

### Using in Code

```python
import requests

headers = {
    "x-personal-token": "abc123def456:secret-key-here"
}
response = requests.get("https://your-server/api/devices", headers=headers)
print(response.json())
```

```bash
# Using the ControlR.ApiClient NuGet package
var client = new ControlRClient(new ControlrApiClientOptions {
    BaseUrl = new Uri("https://your-server.example.com"),
    PersonalAccessToken = "abc123def456:secret-key-here"
});
```

## Managing Tokens

| Action | Description |
|--------|-------------|
| **List** | View all your active tokens |
| **Rename** | Update the friendly name of a token |
| **Delete** | Revoke a token — it will no longer work for authentication |

## Rate Limiting

PAT authentication failures are rate-limited to **5 attempts per 5 minutes** per token prefix + IP combination. This helps prevent brute-force attacks.

## Security Best Practices

- **Store tokens securely** — never commit them to source control
- **Use descriptive names** — makes it easy to identify and revoke tokens
- **Rotate tokens regularly** — delete and recreate tokens periodically
- **Use minimum permissions** — create tokens with the least privilege needed

## Next

- **[Authentication Guide](/docs/authentication-guide)** — All authentication methods
- **[API Overview](/docs/api/overview)** — API structure and conventions
