# Docs Sync Check

GitHub Actions workflow for automatically analyzing ControlR source changes and generating documentation update recommendations.

## How it works

1. On each release (or manual trigger), the workflow compares the latest ControlR version to the last-synced version tracked in `.github/docs-sync-version.txt`.
2. If there are changes, it diffs the source and runs Qwen CLI in headless mode to analyze what documentation pages need updating.
3. In **report-only mode** (default), it creates a GitHub issue with recommendations and links to the full analysis in the workflow run.
4. In **PR mode** (`report_only: false`), it generates a PR with doc updates.

## Setup

### Secrets

Add these as GitHub secrets (Settings → Secrets and variables → Actions → New repository secret):

| Secret name | Description |
|-------------|-------------|
| `OPENAI_API_KEY` | API key for the model provider |
| `OPENAI_BASE_URL` | Base URL for the API endpoint (e.g., `https://api.openai.com/v1`) |

The workflow runs on a **self-hosted runner**. Ensure the runner has:

- `qwen` CLI available in PATH
- `jq` installed (for GitHub API calls)
- Git configured with user info

### Initial version

Edit `.github/docs-sync-version.txt` to the last version you've synced docs with. Current: `v0.24.16.0`.

## Triggering

### Automatic — on release

The workflow fires when a new GitHub release is published. No manual action needed.

### Manual — via workflow_dispatch

Go to **Actions → Docs Sync Check → Run workflow** and configure:

| Input | Description | Default |
|-------|-------------|---------|
| `report_only` | `true` = create issue, `false` = generate PR | `true` |
| `target_version` | Override version tag (omit to auto-detect) | auto |
| `last_synced_version` | Override last synced version | from file |
| `model` | Model to use (sonnet, opus, haiku) | sonnet |
| `max_wall_time` | Max time for analysis (e.g., `5m`, `10m`) | `10m` |

## Workflow files

| File | Purpose |
|------|---------|
| `.github/workflows/docs-sync.yml` | GitHub Actions workflow definition |
| `.github/docs-sync-version.txt` | Tracks last synced version (committed to git) |

## Mode selection

| Mode | Use case |
|------|----------|
| `report_only: true` | Review what needs updating, apply changes manually |
| `report_only: false` | Generate a PR with changes (requires testing) |

Start with `report_only: true` to calibrate. Once you trust the output, switch to `false`.
