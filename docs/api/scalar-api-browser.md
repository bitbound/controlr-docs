---
sidebar_position: 3
title: Scalar API Browser
---

## Overview

ControlR includes the [Scalar](https://scalar.com) API reference UI, an interactive, browsable view of every API endpoint. Enable it on a per-deployment basis (off by default in production).

## Enabling the Scalar UI

The flag defaults to `false`, and the shipped `appsettings.json` sets it to `false`. `appsettings.Development.json` sets it to `true`. Enable it in your own deployment by setting:

```yaml
ControlR_AppOptions__EnableScalarUi: true
```

The flag controls more than the UI. The OpenAPI JSON endpoints are registered inside the same block, so turning the flag off also removes the machine-readable documents. See [OpenAPI Specification](#openapi-specification).

## Accessing the Browser

Once enabled, navigate to:

```
https://your-server/scalar
```

That redirects to `/scalar/`. You can also open one document directly at `/scalar/v1` or `/scalar/internal`.

This opens the interactive API documentation where you can:

- **Browse all endpoints** organized by controller/tag
- **View request/response schemas** for each endpoint
- **Test API calls** directly from the browser
- **See authentication requirements** for each endpoint
- **View example requests and responses**

Deprecated operations are rendered with a deprecated marker. Nearly every unversioned `/api/*` action carries an `[ApiDeprecated]` attribute, and the `internal` document marks those operations `deprecated: true` and adds an `x-replacement-route` extension naming the V1 replacement.

## Using the Interactive Tester

1. Select an endpoint from the sidebar
2. Fill in required parameters and request body
3. Add your credential. The documents advertise an API key, a personal access token, and a cookie. Enter the value for the `x-api-key` or `x-personal-token` header, not an `Authorization` header. See the note below about bearer tokens.
4. Click **Send** to execute the request
5. View the response with headers, status code, and body

Bearer tokens are a special case. The server only recognizes `Authorization: Bearer ...` when it runs with `ControlR_AppOptions__EnableInteractiveBearerLogin=true`, and that is off by default. The documents describe the cookie, `x-personal-token`, and `x-api-key` security schemes. On routes in the `internal` document the tester offers the cookie and `x-personal-token`, because those operations list only those two credentials, and the server accepts `x-api-key` there too.

## OpenAPI Specification

Two OpenAPI documents are published. Both are served from the same host and are available only while `EnableScalarUi` is on.

```
https://your-server/openapi/v1.json
https://your-server/openapi/internal.json
```

| Document | Covers | Use it for |
|---|---|---|
| `v1` | `/api/v1/*` | The supported, versioned contract. This is the one to generate a client from. |
| `internal` | `/api/*` and `/api/agent/*` | ControlR's own front-end surface and the agent contract. Mostly deprecated. |

A request for either path returns `404` when `EnableScalarUi` is off. There is no separate document for `/api/agent/*`. Those routes sit in `internal.json`.

You can use these files to:

- Import into API tools (Postman, Insomnia, etc.)
- Generate client libraries with Swagger Codegen or Kiota
- Validate API payloads against the published schema

The paths above are relative to your server origin. For a host at `https://your-server`, fetch the JSON from `https://your-server/openapi/v1.json`.

## Route Architecture

The API is organized into three route roots:

| Route root | Audience | Description |
|---|---|---|
| `/api/v1/*` | S2S automation | Versioned stable contract for integrations |
| `/api/*` | Blazor Web UI | Deprecated BFF endpoints, no versioning |
| `/api/agent/*` | Device agents | The device and agent-update routes are anonymous, and `/api/agent/deployment-options` requires an agent signature |

Scalar does not group by route root. It lists one entry per OpenAPI document, and there are two documents. The `v1` document holds the versioned routes. The `internal` document holds the unversioned routes and the agent routes together, because both are assigned to the `Internal` API-explorer group. Use the tags inside each document to find a resource. See the [API Overview](/docs/api/overview) for details on each surface.

### .NET API Client

A typed .NET API client is published on NuGet as [`ControlR.ApiClient`](https://www.nuget.org/packages/ControlR.ApiClient/). Prefer the pre-built package over generating your own:

```bash
dotnet add package ControlR.ApiClient
```

See [NuGet Packages](/docs/api-reference/nuget-packages) for setup and authentication options.

## Production Deployment

For production, it's recommended to keep `ControlR_AppOptions__EnableScalarUi` set to `false` to avoid exposing API documentation publicly. You can enable it temporarily for debugging or testing.

## Next

- **[API Overview](/docs/api/overview)**: API structure and conventions
- **[Authentication](/docs/api/authentication)**: Credential formats and header names
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
