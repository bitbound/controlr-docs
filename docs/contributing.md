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

- [.NET SDK](https://dotnet.microsoft.com/download) (latest LTS)
- [Node.js](https://nodejs.org/) (for web client)
- [Docker](https://www.docker.com/) (for server)

### Building

```bash
cd ControlR
dotnet restore
dotnet build
```

### Running Locally

```bash
dotnet run --project ControlR.Web.Server
```

## Pull Request Guidelines

- Follow the existing code style
- Include tests for new functionality
- Update documentation as needed
- Reference any related issues

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

## Questions?

Join the [Discord community](https://discord.gg/JWJmMPc72H) or start a [GitHub Discussion](https://github.com/bitbound/ControlR/discussions).
