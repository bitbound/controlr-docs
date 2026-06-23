---
sidebar_position: 2
title: NuGet Packages
---

## Overview

ControlR publishes several NuGet packages for integrating with the platform programmatically. These packages can be used in your own .NET applications for automation, custom tooling, and viewer development.

## Available Packages

### ControlR.ApiClient

A typed .NET API client for interacting with the ControlR REST API. Handles authentication, token refresh, and provides strongly-typed methods for all API endpoints.

[![NuGet](https://img.shields.io/nuget/v/ControlR.ApiClient)](https://www.nuget.org/packages/ControlR.ApiClient/)

**Installation:**

```bash
dotnet add package ControlR.ApiClient
```

**Usage:**

```csharp
using ControlR.ApiClient;

var client = new ControlrClient(new ControlrApiClientOptions
{
    BaseUrl = new Uri("https://your-server.example.com"),
    PersonalAccessToken = "tokenId:secret"
});

// List devices
var devices = await client.GetDevices();

// Get device details
var device = await client.GetDevice(deviceId);

// Send terminal input
await client.SendTerminalInput(deviceId, terminalInput);
```

**Authentication options:**

| Method | Configuration |
|--------|--------------|
| **Personal Access Token** | Set `PersonalAccessToken` in `ControlrApiClientOptions` |
| **Bearer Token** | Set `BearerToken` in `ControlrApiClientOptions` |
| **Interactive Login** | Use `ControlrAuthSession` to log in with username/password |

### ControlR.Viewer.Avalonia

An Avalonia UI viewer control for embedding remote control sessions directly into your own Avalonia applications.

[![NuGet](https://img.shields.io/nuget/v/ControlR.Viewer.Avalonia)](https://www.nuget.org/packages/ControlR.Viewer.Avalonia/)

**Installation:**

```bash
dotnet add package ControlR.Viewer.Avalonia
```

**Usage:**

```csharp
using ControlR.Viewer;

// Build the viewer service
var viewerService = ViewerServiceBuilder
    .Create()
    .WithServerUri(new Uri("https://your-server.example.com"))
    .WithPersonalAccessToken("tokenId:secret")
    .Build();

// Create a viewer control
var viewerControl = new ControlrViewer
{
    DeviceId = deviceId,
    ViewerService = viewerService
};
```

This package is ideal for building custom remote control dashboards, help desk tools, or integrating remote access into existing Avalonia applications.

### ControlR.Libraries.Avalonia

Shared Avalonia UI components and utilities used across ControlR's desktop applications. Useful if you're building tooling that integrates with the ControlR ecosystem.

[![NuGet](https://img.shields.io/nuget/v/ControlR.Libraries.Avalonia)](https://www.nuget.org/packages/ControlR.Libraries.Avalonia/)

## Example Projects

The ControlR repository includes example projects demonstrating how to use these packages:

| Project | Description |
|---------|-------------|
| `ControlR.ApiClientExample` | Console application using the API client to list devices and interact with the server |
| `ControlR.AvaloniaViewerExample` | Desktop application embedding the Avalonia viewer control |

Source code for both examples is available in the [ControlR repository](https://github.com/bitbound/ControlR/tree/main/Examples).

## Next

- **[API Overview](/docs/api/overview)**: REST API structure and conventions
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
- **[Authentication Guide](/docs/authentication-guide)**: Authentication methods for API access