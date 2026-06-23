---
sidebar_position: 0
title: Scalar API Browser
---

## Overview

ControlR includes the [Scalar](https://scalar.com) API reference UI, which provides an interactive, browsable view of all available API endpoints. It lets you explore, understand, and test the ControlR API interactively.

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
- Generate API clients in any language
- Import into API testing tools (Postman, Insomnia, etc.)
- Build custom documentation

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
