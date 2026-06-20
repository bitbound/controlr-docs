---
sidebar_position: 0
title: API Overview
---

## Overview

ControlR provides a RESTful API for programmatic access to its features. All API endpoints require authentication.

## Base URL

```
https://your-controlr-server/api/v1
```

## Authentication

All API requests must include a valid authentication token. See the [Authentication](/docs/api/authentication) guide for details.

## Response Format

All responses are returned in JSON format:

```json
{
  "success": true,
  "data": {},
  "errors": []
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

| Code | Description |
|------|-------------|
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `500` | Internal Server Error |

## Next

- **[Authentication](/docs/api/authentication)** — How to authenticate API requests
