---
sidebar_position: 1
title: Authentication
---

## Authentication Overview

ControlR uses JWT (JSON Web Tokens) for API authentication.

## Obtaining a Token

To authenticate, send a POST request to the login endpoint:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

A successful response returns a JWT token:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

## Using the Token

Include the token in subsequent requests using the `Authorization` header:

```http
GET /api/v1/devices
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Refresh

Tokens expire after a configurable period. Use the refresh endpoint to obtain a new token without re-authenticating:

```http
POST /api/v1/auth/refresh
Authorization: Bearer your-refresh-token
```

## API Keys

API keys can be generated in the ControlR admin panel for service-to-service authentication. They provide longer-lived access and granular permissions.
