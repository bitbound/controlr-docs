---
sidebar_position: 8
title: Contributing
---

## Contributing to ControlR

We welcome contributions from the community! Here's how you can help.

## Getting Started

1. Fork the [ControlR repository](https://github.com/bitbound/ControlR)
2. Clone your fork locally
3. Create a branch for your changes
4. Make your changes and commit them
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (ControlR targets .NET 10.0)
- [Node.js](https://nodejs.org/) (for web client build)
- [Docker](https://www.docker.com/) (for PostgreSQL and Aspire during local development)
- [Aspire Dashboard](https://learn.microsoft.com/dotnet/aspnetcore/fundamentals/aspirer) (for telemetry during local development)

### Building

```bash
cd ControlR
dotnet restore
dotnet build
```

### Running Locally

The recommended way to run locally is through the Aspire AppHost, which orchestrates the server, PostgreSQL, and Aspire Dashboard:

```bash
dotnet run --project ControlR.Web.AppHost
```

This starts:
- **ControlR Web Server** on `http://localhost:5120`
- **PostgreSQL** on port 5432
- **Aspire Dashboard** on `http://localhost:18888`

For direct server-only development:

```bash
dotnet run --project ControlR.Web.Server
```

Note: Running the server directly requires PostgreSQL to be available separately.

## Pull Request Guidelines

- Follow the existing code style
- Include tests for new functionality
- Update documentation as needed
- Reference any related issues

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

## Questions?

Join the [Discord community](https://discord.gg/JWJmMPc72H) or start a [GitHub Discussion](https://github.com/bitbound/ControlR/discussions).
