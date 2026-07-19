---
sidebar_position: 0
title: Scalar API Browser
---

## Overview

ControlR includes the [Scalar](https://scalar.com) API reference UI, an interactive, browsable view of every API endpoint. Enable it on a per-deployment basis (off by default in production).

## Enabling the Scalar UI

The Scalar UI is disabled by default in production. Enable it by setting:

```yaml
ControlR_AppOptions__EnableScalarUi: true
```

## Accessing the Browser

Once enabled, navigate to:

```
https://your-server/scalar
```

This opens the interactive API documentation where you can:

- **Browse all endpoints** organized by controller/category
- **View request/response schemas** for each endpoint
- **Test API calls** directly from the browser
- **See authentication requirements** for each endpoint
- **View example requests and responses**

## Using the Interactive Tester

1. Select an endpoint from the sidebar
2. Fill in required parameters and request body
3. Add your authentication token (cookie, bearer token, or PAT)
4. Click **Send** to execute the request
5. View the response with headers, status code, and body

## OpenAPI Specification

The OpenAPI specification is also available as a standalone JSON file:

```
https://your-server/openapi/v1.json
```

You can use this file to:

- Import into API tools (Postman, Insomnia, etc.)
- Generate client libraries with Swagger Codegen or Kiota
- Validate API payloads against the published schema

The path above is relative to your server origin. For a host at `https://your-server`, fetch the JSON from `https://your-server/openapi/v1.json`.

## Route Architecture

The API is organized into three route roots:

| Route root | Audience | Description |
|---|---|---|
| `/api/internal/*` | Blazor Web UI | Dynamic BFF endpoints, no versioning |
| `/api/v1/*` | S2S automation | Versioned stable contract for integrations |
| `/api/agent/*` | Device agents | Anonymous agent communication |

The Scalar UI reflects this structure, grouping endpoints by their route root. See the [API Overview](/docs/api/overview) for details on each surface.

### .NET API Client

A typed .NET API client is published on NuGet as [`ControlR.ApiClient`](https://www.nuget.org/packages/ControlR.ApiClient/). Generate it from the OpenAPI spec or use the pre-built package:

```bash
dotnet add package ControlR.ApiClient
```

## Production Deployment

For production, it's recommended to keep `ControlR_AppOptions__EnableScalarUi` set to `false` to avoid exposing API documentation publicly. You can enable it temporarily for debugging or testing.

## Next

- **[API Overview](/docs/api/overview)**: API structure and conventions
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
