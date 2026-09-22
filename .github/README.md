# Docs Version Sync

GitHub Actions workflow that keeps `.github/docs-sync-version.txt` pointed at the latest ControlR release. That file is read by `docusaurus.config.ts` and published as the ControlR version shown on the docs site.

## How it works

1. On a manual trigger, the workflow reads the latest release tag from the `bitbound/ControlR` repo.
2. If the tag differs from `.github/docs-sync-version.txt`, the workflow rewrites the file, commits, and pushes the update to the default branch.
3. If the tag already matches, the run is a no-op.

The workflow does not analyze source diffs or edit documentation. Updating docs content is a manual task.

## Setup

### Runner

The workflow runs on a **self-hosted runner**. Ensure the runner has:

- `curl` and `jq` installed (for the latest-release lookup)
- Git configured with user info

No repository secrets are required. The workflow pushes with the built-in `GITHUB_TOKEN`, which needs **Contents: Write** permission on the repository.

### Initial version

`.github/docs-sync-version.txt` holds the version the site reports. Current: `v0.24.16.0`.

## Triggering

The workflow runs only when started manually. Go to **Actions → Docs Version Sync → Run workflow** and configure:

| Input | Description | Default |
|-------|-------------|---------|
| `target_version` | ControlR tag to record (omit to auto-detect the latest release) | auto |

## Workflow files

| File | Purpose |
|------|---------|
| `.github/workflows/docs-sync.yml` | GitHub Actions workflow definition |
| `.github/docs-sync-version.txt` | The synced version the site displays (committed to git) |
