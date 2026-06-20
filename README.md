# ControlR Documentation

This repository contains the documentation site for [ControlR](https://github.com/bitbound/ControlR), a cross-platform remote control application.

## Live Site

Visit [docs.controlr.app](https://docs.controlr.app) to view the documentation.

## Development

### Prerequisites

- Node.js >= 20
- npm >= 11

### Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The site will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Serving the Built Site

```bash
npm run serve
```

## Structure

```
docs/              # Documentation markdown files
  intro.md         # Homepage
  getting-started.md
  installation.md
  configuration.md
  features/        # Feature documentation
  admin/           # Administration guides
  api/             # API reference
static/            # Static assets (images, etc.)
docusaurus.config.ts  # Docusaurus configuration
sidebars.ts        # Navigation sidebar
```

## Deploying

This site is configured for GitHub Pages deployment. To deploy:

```bash
npm run deploy
```

Or configure your CI/CD pipeline to build and deploy automatically.

## License

MIT License - see the [ControlR repository](https://github.com/bitbound/ControlR) for details.
