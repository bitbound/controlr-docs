---
sidebar_position: 2
title: NuGet Packages
---

## Overview

ControlR publishes several NuGet packages for integrating with the platform programmatically. These packages can be used in your own .NET applications for automation, custom tooling, and viewer development.

## Available Packages

### ControlR.ApiClient

A typed .NET client for the ControlR REST API. Handles Personal Access Token authentication, interactive bearer sessions with automatic token refresh, and provides strongly-typed methods for every endpoint (devices, installer keys, service accounts, logon tokens, file system, etc.).

[![NuGet](https://img.shields.io/nuget/v/ControlR.ApiClient)](https://www.nuget.org/packages/ControlR.ApiClient/)

**Installation:**

```bash
dotnet add package ControlR.ApiClient
```

**Two ways to use it:** dependency injection (recommended for most apps) or a static builder (useful for console apps and scripts). The underlying `IControlrApi` exposes three nested clients: `Agent`, `Internal`, and `V1`.

#### Option 1: Dependency Injection

Register the client at startup with options:

```csharp
using ControlR.ApiClient;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddControlrApiClient(options =>
{
    options.BaseUrl = new Uri("https://your-controlr-server.com");
    options.PersonalAccessToken = "your-personal-access-token";
});
```

Or load options from a configuration section:

```csharp
builder.Services.AddControlrApiClient(
    builder.Configuration,
    ControlrApiClientOptions.SectionKey);
```

```json
{
  "ControlrApiClient": {
    "BaseUrl": "https://your-controlr-server.com",
    "PersonalAccessToken": "your-personal-access-token"
  }
}
```

Then inject `IControlrApi` into your services:

```csharp
using ControlR.ApiClient;

public class MyService
{
    private readonly IControlrApi _client;

    public MyService(IControlrApi client)
    {
        _client = client;
    }

    public async Task ListDevicesAsync(CancellationToken cancellationToken)
    {
        await foreach (var device in _client.V1.Devices.GetAllDevices(cancellationToken))
        {
            Console.WriteLine($"{device.Name} ({device.Id})");
        }
    }
}
```

#### Option 2: Static Builder

For console apps or scripts where you don't want a full DI host, initialize the builder once and call `GetClient()` anywhere:

```csharp
using ControlR.ApiClient;

ControlrApiClientBuilder.Initialize(options =>
{
    options.BaseUrl = new Uri("https://your-controlr-server.com");
    options.PersonalAccessToken = "your-personal-access-token";
});

var client = ControlrApiClientBuilder.GetClient();
await foreach (var device in client.V1.Devices.GetAllDevices())
{
    Console.WriteLine($"{device.Name} ({device.Id})");
}
```

#### Authentication modes

| Mode | How |
|---|---|
| Personal Access Token | Set `options.PersonalAccessToken` (default; stateless). |
| Interactive Bearer | Set `options.AuthenticationMethod = ViewerAuthenticationMethod.InteractiveBearer`, then use `IControlrAuthSession.SignIn(...)` with email/password. Supports 2FA and the change-password flow. Tokens refresh automatically. |

The client uses `IHttpClientFactory` under the hood, so socket exhaustion and DNS rotation are handled for you.

### ControlR.Viewer.Avalonia

A reusable Avalonia user control that embeds a ControlR viewer (Remote Control, Terminal, File System, Chat, Remote Logs) into your own Avalonia application. You supply authentication, the server URL, and the target device ID.

[![NuGet](https://img.shields.io/nuget/v/ControlR.Viewer.Avalonia)](https://www.nuget.org/packages/ControlR.Viewer.Avalonia/)

**Installation:**

```bash
dotnet add package ControlR.Viewer.Avalonia
```

**Minimal usage:**

1. Resolve `ControlrViewerOptions` somewhere your view models can read it (DI, configuration, user secrets, or hardcoded for testing).
2. Host the `ControlrViewer` control in an Avalonia view, bound to options plus an `ActivePage` and a way to receive errors.
3. Sign in via `IControlrAuthSession` (interactive email/password) or a Personal Access Token.

```csharp
using ControlR.Libraries.Viewer.Common.Enums;
using ControlR.Libraries.Viewer.Common.Options;
using ControlR.Viewer.Avalonia.Services;

public class HostViewModel : ObservableObject
{
    private ViewerPage _activePage = ViewerPage.RemoteControl;
    private string? _errorMessage;

    public ControlrViewerOptions ViewerOptions { get; } = new()
    {
        ServerUri = new Uri("https://your-controlr-server.com"),
        DeviceId = Guid.Parse("f9ae6af7-e397-4a68-8b78-492f822dd7eb"),
    };

    public ViewerPage ActivePage
    {
        get => _activePage;
        set => SetProperty(ref _activePage, value);
    }

    public string? ErrorMessage
    {
        get => _errorMessage;
        set => SetProperty(ref _errorMessage, value);
    }
}
```

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:MyApp.ViewModels"
        xmlns:ctrlr="using:ControlR.Viewer.Avalonia"
        x:Class="MyApp.Views.HostWindow"
        x:DataType="vm:HostViewModel">

  <ctrlr:ControlrViewer Options="{Binding ViewerOptions}"
                        Page="{Binding ActivePage}"
                        ErrorContent="{Binding ErrorMessage}" />
</Window>
```

```csharp
using Avalonia.Controls;
using ControlR.Viewer.Avalonia;

public partial class HostWindow : Window
{
    public HostWindow()
    {
        InitializeComponent();
        // Forward the viewer's connection errors into the ViewModel.
        var viewer = this.FindControl<ControlrViewer>("Viewer"); // x:Name="Viewer"
        if (viewer is not null && DataContext is HostViewModel vm)
        {
            viewer.GetObservable(ControlrViewer.ErrorContentProperty)
                .Subscribe(message => vm.ErrorMessage = message);
        }
    }
}
```

For navigation, set `ActivePage` to one of: `RemoteControl`, `Terminal`, `FileSystem`, `RemoteLogs`, `Chat`.

The viewer itself handles SignalR connection setup once `Options` is bound and auth is provided. See the example below for a full working host.

### ControlR.Libraries.Avalonia

Shared Avalonia UI components and utilities used across ControlR's desktop applications. Useful if you're building tooling that integrates with the ControlR ecosystem.

[![NuGet](https://img.shields.io/nuget/v/ControlR.Libraries.Avalonia)](https://www.nuget.org/packages/ControlR.Libraries.Avalonia/)

## Example Projects

The ControlR repository includes example projects demonstrating how to use these packages:

| Project | Description |
|---------|-------------|
| `ControlR.ApiClientExample` | Console application using the API client to list devices and interact with the server |
| `ControlR.AvaloniaViewerExample` | Desktop application embedding the Avalonia viewer control with interactive login |

The AvaloniaViewerExample uses both the API client and the Avalonia viewer together, and shows the recommended DI setup, sign-in flow, and navigation between the viewer's built-in pages.

Source code for both examples is available in the [ControlR repository](https://github.com/bitbound/ControlR/tree/main/Examples).

## Next

- **[API Overview](/docs/api/overview)**: REST API structure and conventions
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
- **[Authentication Guide](/docs/authentication-guide)**: Authentication methods for API access
