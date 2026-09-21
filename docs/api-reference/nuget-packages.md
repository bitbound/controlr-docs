---
sidebar_position: 5
title: NuGet Packages
---

## Overview

ControlR publishes several NuGet packages for integrating with the platform programmatically. These packages can be used in your own .NET applications for automation, custom tooling, and viewer development.

All of them target `net10.0`. Nothing in the published set carries a Windows- or platform-specific target framework moniker, so any of them can be referenced from a plain `net10.0` project file.

## Published Packages

The release pipeline packs the following project ids. Each is a valid `dotnet add package` argument.

| Package | What it is |
|---|---|
| `ControlR.ApiClient` | Typed client for the REST API. Details below. |
| `ControlR.Viewer.Avalonia` | Embeddable Avalonia viewer control. Details below. |
| `ControlR.Libraries.Avalonia` | Avalonia UI utilities shared by ControlR's desktop apps. Details below. |
| `ControlR.Libraries.Api.Contracts` | DTOs and hub contracts shared by the API client and the server. Reference this if you write your own HTTP client and want the same types. |
| `ControlR.Libraries.Viewer.Common` | Viewer options and enums, including `ControlrViewerOptions` and `ViewerAuthenticationMethod`. Pulled in by the viewer package. |
| `ControlR.Libraries.Signalr.Client` | SignalR client utilities. |
| `ControlR.Libraries.Shared` | Shared utilities. |
| `ControlR.Libraries.Branding` | Branding constants used by whitelabel builds. |
| `ControlR.Libraries.DataRedaction` | Redaction helpers for logs and outputs. |
| `ControlR.Libraries.Messenger.Extensions` | Extensions over the messenger library used by the Avalonia apps. |
| `ControlR.Libraries.WebSocketRelay.Client` | WebSocket relay client utilities. |

## Available Packages

### ControlR.ApiClient

A typed .NET client for the ControlR REST API. Handles Personal Access Token and service-account `x-api-key` authentication, interactive bearer sessions with automatic token refresh, and provides strongly-typed methods for every endpoint (devices, installer keys, service accounts, logon tokens, file system, etc.).

[![NuGet](https://img.shields.io/nuget/v/ControlR.ApiClient)](https://www.nuget.org/packages/ControlR.ApiClient/)

**Installation:**

```bash
dotnet add package ControlR.ApiClient
```

**Two ways to use it:** dependency injection (recommended for most apps) or a static builder (useful for console apps and scripts). The underlying `IControlrApi` exposes three nested clients: `Agent`, `Internal`, and `V1`. Build against `V1`. The `Internal` accessors cover the deprecated unversioned `/api/*` surface, and `Agent` covers the routes the agent installer calls.

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

`ControlrApiClientOptions.SectionKey` is `"ControlrApiClient"`. There is also an `IHostApplicationBuilder` overload, which is what the example app uses:

```csharp
builder.AddControlrApiClient(ControlrApiClientOptions.SectionKey);
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
        await foreach (var device in _client.V1.Devices
            .GetAllDevices(cancellationToken)
            .WithCancellation(cancellationToken))
        {
            Console.WriteLine($"{device.Name} ({device.Id})");
        }
    }
}
```

`GetAllDevices` returns `IAsyncEnumerable<DeviceResponseDto>`. Pass the token to both `GetAllDevices` and `WithCancellation`, so an abandoned loop is cancelled too.

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

`Initialize` is first-call-wins. A later call is ignored until `ControlrApiClientBuilder.Dispose()` runs. `GetClient()` throws `InvalidOperationException` unless `Initialize` ran. Do not use this path from Blazor WebAssembly.

#### Authentication modes

The options type is `ControlrApiClientOptions`. Note the lowercase `r` in `Controlr`.

| Mode | How |
|---|---|
| Personal Access Token | Set `options.PersonalAccessToken`. The client sends it as `x-personal-token`. |
| Service account | Set `options.ServiceAccountApiKey`. The client sends it as `x-api-key`. |
| Interactive Bearer | Sign in through `IControlrAuthSession` instead of setting a credential on the options. Tokens refresh automatically. See below. |

`ControlrApiClientOptions` has no `AuthenticationMethod` property. That property belongs to the viewer options, described under [ControlR.Viewer.Avalonia](#controlrvieweravalonia). The API client infers the mode from whichever credential you set.

The interactive bearer mode needs the server to run with `ControlR_AppOptions__EnableInteractiveBearerLogin=true`. That flag gates both the `Authorization: Bearer` handler and the `/api/auth/*` endpoints the client uses for sign-in and refresh, and it is off in the shipped `appsettings.json`.

```csharp
using ControlR.ApiClient;
using ControlR.ApiClient.Auth;

var auth = ControlrApiClientBuilder.GetAuthSession();

var result = await auth.SignIn(
    new InteractiveSignInRequest
    {
        Email = email,
        Password = password,
        TwoFactorCode = twoFactorCode,
    },
    cancellationToken);

switch (result.Status)
{
    case InteractiveLoginStatus.Authenticated:
        break;
    case InteractiveLoginStatus.RequiresTwoFactor:
        // Ask for the code, then call SignIn again with TwoFactorCode set.
        break;
    case InteractiveLoginStatus.RequiresPasswordChange:
        await auth.ChangePasswordWithCredentials(
            email, password, newPassword, twoFactorCode, cancellationToken);
        break;
    case InteractiveLoginStatus.LockedOut:
    case InteractiveLoginStatus.Failed:
    default:
        Console.WriteLine(result.Message);
        break;
}
```

`SignIn` takes an `InteractiveSignInRequest`, not a pair of strings. It returns an `InteractiveLoginResult` carrying a `Status` from `InteractiveLoginStatus` and an optional `Message`. Both types are in `ControlR.ApiClient.Auth`. `Email` and `Password` are `required`. `TwoFactorCode` and `RecoveryCode` are optional.

`IControlrAuthSession` also exposes `ChangePasswordWithCredentials`, `GetBearerToken`, `SignOut`, `SetPersonalAccessToken`, `SetServiceAccountApiKey`, `GetAuthSnapshot`, `RestoreAuthSnapshot`, and a `StateChanged` event. Refresh runs on a background loop that wakes before expiry, using the `BearerRefreshLeadTime` option, and a request that still lands a `401` is retried once after a forced refresh.

The DI path registers typed clients through `IHttpClientFactory`, which handles socket exhaustion and DNS rotation. The static-builder path wraps one `HttpClient` in an internal factory instead, so it does not pick up handler lifetimes the way the DI path does.

### ControlR.Viewer.Avalonia

A reusable Avalonia user control that embeds a ControlR viewer (Remote Control, Terminal, File System, Chat, Remote Logs) into your own Avalonia application. You supply authentication, the server URL, and the target device ID.

[![NuGet](https://img.shields.io/nuget/v/ControlR.Viewer.Avalonia)](https://www.nuget.org/packages/ControlR.Viewer.Avalonia/)

**Installation:**

```bash
dotnet add package ControlR.Viewer.Avalonia
```

**Minimal usage:**

1. Resolve `ControlrViewerOptions` somewhere your view models can read it (DI, configuration, user secrets, or hardcoded for testing).
2. Host the `ControlrViewer` control in an Avalonia view, bound to options plus a page and a way to receive errors.
3. For the personal-access-token mode, put the token in the options. For the interactive mode, sign in through `IControlrAuthSession`.

```csharp
using CommunityToolkit.Mvvm.ComponentModel;
using ControlR.Libraries.Viewer.Common.Options;
using ControlR.Viewer.Avalonia.Services.Navigation;

public class HostViewModel : ObservableObject
{
    private ViewerPage _activePage = ViewerPage.RemoteControl;
    private string? _errorMessage;

    // ControlrViewerOptions and ViewerAuthenticationMethod both live in
    // ControlR.Libraries.Viewer.Common.Options. ViewerPage does not.
    public ControlrViewerOptions ViewerOptions { get; } = new()
    {
        AuthenticationMethod = ViewerAuthenticationMethod.PersonalAccessToken,
        BaseUrl = new Uri("https://your-controlr-server.com"),
        DeviceId = Guid.Parse("f9ae6af7-e397-4a68-8b78-492f822dd7eb"),
        PersonalAccessToken = "your-personal-access-token",
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

`ControlR.Viewer.Avalonia` already brings `CommunityToolkit.Mvvm` in as a package dependency, so no extra package reference is needed for `ObservableObject`.

`BaseUrl`, `AuthenticationMethod`, and `DeviceId` are all `required`. `PersonalAccessToken` is the only optional member. There is no `ServerUri` property.

The `ViewerPage` enum lives in `ControlR.Viewer.Avalonia.Services.Navigation`, not in `ControlR.Libraries.Viewer.Common`. Its members are `None`, `RemoteControl`, `FileSystem`, `Terminal`, `RemoteLogs`, and `Chat`. `None` is the default value of the control's `Page` property, and it means no page is navigated to.

The control initializes when it is attached to the visual tree. It refuses to initialize, and writes a message into `ErrorContent`, when `Options` is null, `BaseUrl` is null, `DeviceId` is empty, the authentication method is `PersonalAccessToken` with a blank `PersonalAccessToken`, or the control has no `TopLevel` with a clipboard. Setting `Page` before that initialization is not lost. The control holds it as a pending page and navigates once the shell is connected.

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:MyApp.ViewModels"
        xmlns:ctrlr="using:ControlR.Viewer.Avalonia"
        x:Class="MyApp.Views.HostWindow"
        x:DataType="vm:HostViewModel">

  <ctrlr:ControlrViewer x:Name="Viewer"
                        Options="{Binding ViewerOptions}"
                        Page="{Binding ActivePage}"
                        ErrorContent="{Binding ErrorMessage, Mode=OneWayToSource}" />
</Window>
```

The three bindable properties you set are `Options`, `Page`, and `ErrorContent`. There is a fourth, `InstanceId`, and it is read-only outside the control.

`ErrorContent` is written by the control, never read. A plain binding on it points the wrong way, so use `Mode=OneWayToSource` as above, or bind nothing and subscribe instead. `ErrorContentProperty` is a public static styled property, so this compiles:

```csharp
using Avalonia.Controls;
using ControlR.Viewer.Avalonia;

public partial class HostWindow : Window
{
    public HostWindow()
    {
        InitializeComponent();
        var viewer = this.FindControl<ControlrViewer>("Viewer");
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
| `Examples/ControlR.ApiClientExample` | Console application using the API client to list devices and interact with the server |
| `Examples/ControlR.AvaloniaViewerExample` | Desktop application embedding the Avalonia viewer control with interactive login |

The AvaloniaViewerExample uses both the API client and the Avalonia viewer together, and shows the recommended DI setup, sign-in flow, and navigation between the viewer's built-in pages.

Source code for both examples is available in the [ControlR repository](https://github.com/bitbound/ControlR/tree/main/Examples).

## Next

- **[API Overview](/docs/api/overview)**: REST API structure and conventions
- **[API Endpoints](/docs/api-reference/endpoints)**: Complete endpoint reference
- **[Authentication Guide](/docs/authentication-guide)**: Authentication methods for API access
