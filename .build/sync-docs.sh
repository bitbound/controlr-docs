#!/usr/bin/env bash
#
# sync-docs.sh — Sync controlr-docs with ControlR source changes
#
# This script compares the last-synced version (stored in
# controlr-version.txt) against the latest ControlR release,
# analyzes the source diff using the `qwen` CLI agent, and either
# creates an update plan (.plans/) or directly edits the docs.
#
# Usage:
#   ./sync-docs.sh plan     Analyze source diff and write a plan
#   ./sync-docs.sh code     Analyze source diff and update docs directly
#
# Requirements:
#   - gh  (GitHub CLI) — authenticated to github.com
#   - qwen CLI — installed and configured with a default model
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION_FILE="$REPO_ROOT/controlr-version.txt"
PLANS_DIR="$REPO_ROOT/.plans"
CONTROLr_CLONE="$REPO_ROOT/.controlr-src"
DOCS_DIR="$REPO_ROOT/docs"

# Magic empty-tree hash — used as the "parent" when there is no previous version
EMPTY_TREE="4b825dc642cb6eb9a060e54bf899d153036e1e3b"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

red()    { printf "\033[31m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
blue()   { printf "\033[34m%s\033[0m\n" "$*"; }
bold()   { printf "\033[1m%s\033[0m\n" "$*"; }

usage() {
  cat <<EOF
Usage: $(basename "$0") <plan|code>

  plan   Analyze the latest ControlR source diff and create an update
         plan under the .plans/ directory (without modifying any files).

  code   Analyze the latest ControlR source diff and directly update
         the documentation files in docs/.

Requires:
  - gh   (GitHub CLI) authenticated to github.com
  - qwen CLI installed and configured (with a default model set)
EOF
  exit 1
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  local mode="${1:-}"
  [[ "$mode" =~ ^(plan|code)$ ]] || usage

  # ------- 1. Check prerequisites -------

  if ! command -v qwen &>/dev/null; then
    red "qwen CLI not found on PATH. Please install it first."
    exit 1
  fi

  # ------- 2. GitHub auth check -------

  blue "Checking GitHub CLI authentication…"
  local gh_hosts
  gh_hosts="$(gh auth status --json hosts 2>/dev/null)" || {
    red "Not authenticated with GitHub CLI."
    echo "Run  gh auth login  first."
    exit 1
  }

  local active
  active="$(echo "$gh_hosts" | jq -r '.hosts["github.com"][0].active // false')"
  if [[ "$active" != "true" ]]; then
    red "GitHub host 'github.com' is not active."
    echo "Run  gh auth login  first."
    exit 1
  fi
  green "Authenticated to github.com as $(echo "$gh_hosts" | jq -r '.hosts["github.com"][0].login // "?"')."

  # ------- 3. Read current synced version -------

  local current_version
  if [[ -f "$VERSION_FILE" ]]; then
    current_version="$(cat "$VERSION_FILE")"
  else
    current_version="0.0.0.0"
    yellow "No version file found at $VERSION_FILE — defaulting to $current_version"
  fi

  # ------- 4. Fetch latest ControlR release -------

  blue "Fetching latest ControlR release from bitbound/ControlR…"
  local latest_version
  latest_version="$(gh release view --repo bitbound/ControlR --json tagName --jq '.tagName' 2>/dev/null)" || {
    red "Failed to fetch the latest release from bitbound/ControlR."
    exit 1
  }
  green "Latest release:  $latest_version"

  # ------- 5. Display version banner -------

  echo ""
  bold "╔══════════════════════════════════════════════╗"
  bold "║         controlr-docs —— Sync Check         ║"
  bold "╠══════════════════════════════════════════════╣"
  printf "\033[1m║  %-20s  %16s  ║\033[0m\n" "Docs synced to" "$current_version"
  printf "\033[1m║  %-20s  %16s  ║\033[0m\n" "Latest ControlR" "$latest_version"
  bold "╚══════════════════════════════════════════════╝"
  echo ""

  # ------- 6. Skip if already current -------

  if [[ "$current_version" == "$latest_version" ]]; then
    green "Already synced to $latest_version. Nothing to do."
    exit 0
  fi

  yellow "New release detected! $current_version → $latest_version"

  # ------- 7. Clone / fetch ControlR source (bare) -------

  if [[ -d "$CONTROLr_CLONE" ]]; then
    yellow "Updating existing ControlR clone…"
    git -C "$CONTROLr_CLONE" fetch origin --tags --force 2>&1 | tail -1
  else
    blue "Cloning ControlR source (bare)…"
    git clone --bare https://github.com/bitbound/ControlR.git "$CONTROLr_CLONE"
  fi
  green "ControlR source ready."

  # ------- 8. Generate diff -------

  blue "Generating diff…"
  local old_ref

  # If current_version doesn't resolve to a commit, diff from the empty tree
  if git -C "$CONTROLr_CLONE" cat-file -e "$current_version" &>/dev/null; then
    old_ref="$current_version"
  else
    yellow "Version '$current_version' not found in ControlR history — diffing from initial commit."
    old_ref="$EMPTY_TREE"
  fi

  git -C "$CONTROLr_CLONE" diff "$old_ref..$latest_version" > /tmp/docs-diff.txt
  git -C "$CONTROLr_CLONE" diff "$old_ref..$latest_version" --name-only > /tmp/docs-changed-files.txt
  git -C "$CONTROLr_CLONE" diff "$old_ref..$latest_version" --stat > /tmp/docs-diff-stat.txt

  local file_count
  file_count="$(wc -l < /tmp/docs-changed-files.txt | tr -d ' ')"
  green "$file_count files changed between $old_ref and $latest_version."

  if [[ "$file_count" -eq 0 ]]; then
    yellow "No file differences — nothing to sync."
    exit 0
  fi

  # ------- 9. Classify changes -------

  local has_api=false has_config=false has_installer=false

  if grep -qE '(Controllers|Api)/' /tmp/docs-changed-files.txt 2>/dev/null; then
    has_api=true
    yellow "  • API changes detected"
  fi
  if grep -qiE '(Options|Config)/' /tmp/docs-changed-files.txt 2>/dev/null; then
    has_config=true
    yellow "  • Config changes detected"
  fi
  if grep -qi 'Installer' /tmp/docs-changed-files.txt 2>/dev/null; then
    has_installer=true
    yellow "  • Installer changes detected"
  fi

  if ! $has_api && ! $has_config && ! $has_installer; then
    yellow "No source changes that typically affect documentation. Nothing to do."
    exit 0
  fi
  echo ""

  # ------- 10. Run qwen -------

  local last="$current_version"
  local target="$latest_version"

  # Build the "changed categories" line for prompts
  local categories=""
  $has_api      && categories="$categories, API"
  $has_config   && categories="$categories, Config"
  $has_installer && categories="$categories, Installer"
  categories="${categories#, }"  # strip leading comma

  # ── 10a. Plan mode ────────────────────────────────────────────────────

  if [[ "$mode" == "plan" ]]; then
    mkdir -p "$PLANS_DIR"
    local plan_file
    plan_file="$PLANS_DIR/sync-$target-$(date +%Y%m%d%H%M%S).md"

    blue "Running qwen in plan mode…"
    echo "  Plan will be written to: $plan_file"
    echo ""

    cat > /tmp/qwen-plan-prompt.md <<ENDPROMPT
You are a documentation specialist for ControlR, a self-hosted remote-control application.

## Context

The ControlR source code has changed between \`$last\` and \`$target\$.
The following categories were affected: $categories.

### Files available on disk

| File | Path |
|------|------|
| Full diff | /tmp/docs-diff.txt |
| Changed file list | /tmp/docs-changed-files.txt |
| Diff stats | /tmp/docs-diff-stat.txt |
| Current docs | $DOCS_DIR |

## Task

1. Read the diff files to understand what changed.
2. For each affected category (API, Config, Installer), examine the relevant source changes and identify which documentation pages need updating.
3. Write a structured update plan to the file:

   **$plan_file**

Use exactly this format:

## Version $last → $target: Docs Update Recommendations

### Overview
- X files changed, X additions, X deletions
- Changed categories: $categories

### Pages Needing Updates

#### \`{page-title}\` (\`{relative-path}\`)
**What changed:** Brief description of the relevant source changes.
- [ ] {specific change 1}
- [ ] {specific change 2}

---

Repeat "Pages Needing Updates" for each page.

## Guidelines

- Be precise — only recommend changes supported by the diff.
- If a config option was renamed, recommend updating the old name.
- If a new API endpoint was added, recommend adding it to the endpoints reference.
- If a config option was added, recommend it to the configuration reference with type/default/description.
- If installer arguments changed, recommend updating the installer-args table.
- If no pages need changes, write: "No documentation updates needed for this release."

After writing the file, print a short summary of what you found and how many pages need updates.
ENDPROMPT

    qwen -p "$(cat /tmp/qwen-plan-prompt.md)" \
      --yolo \
      --max-wall-time 10m \
      --output-format text \
      --max-tool-calls 50

    local plan_result="?"
    if [[ -f "$plan_file" ]]; then
      plan_result="$(wc -l < "$plan_file" | tr -d ' ')"
      green "Plan written → $plan_file ($plan_result lines)"
    else
      yellow "Warning: plan file was not created at $plan_file"
    fi

  # ── 10b. Code mode ────────────────────────────────────────────────────

  else
    blue "Running qwen in code mode (docs will be edited directly)…"
    echo ""

    cat > /tmp/qwen-code-prompt.md <<ENDPROMPT
You are a documentation specialist for ControlR, a self-hosted remote-control application. You have direct access to edit files.

## Context

The ControlR source code has changed between \`$last\` and \`$target\`.
The following categories were affected: $categories.

### Files available on disk

| File | Path |
|------|------|
| Full diff | /tmp/docs-diff.txt |
| Changed file list | /tmp/docs-changed-files.txt |
| Diff stats | /tmp/docs-diff-stat.txt |
| Current docs | $DOCS_DIR |

## Task

1. Read the diff files to understand what changed between \`$last\` and \`$target\`.
2. **Edit** the documentation files in \`$DOCS_DIR\` to reflect those changes — use the edit/file tools to make precise modifications.
3. After making all edits, output a summary.

## Guidelines

- Only edit what needs editing — don't touch unrelated pages.
- Preserve existing formatting and structure.
- If a config option was renamed, update the old name to the new name.
- If a new API endpoint was added, add it to the API endpoints reference.
- If a config option was added, add it to the configuration reference with type, default, and description.
- If installer arguments changed, update the installer-args table.
- If no pages need changes, say so.

## Summary format (print at the end)

## Edits Summary for $target
- {page-path}: {brief description}
---
ENDPROMPT

    qwen -p "$(cat /tmp/qwen-code-prompt.md)" \
      --system-prompt "You are a documentation specialist for ControlR, a self-hosted remote-control application. Be thorough, precise, and make complete edits. Only touch files that actually need changes." \
      --yolo \
      --max-wall-time 15m \
      --output-format text \
      --max-tool-calls 100

    # Show dirty state so the user knows what changed
    if [[ -n "$(git -C "$REPO_ROOT" status --porcelain docs/ 2>/dev/null)" ]]; then
      echo ""
      yellow "Uncommitted changes in docs/:"
      git -C "$REPO_ROOT" status --short docs/
    fi
  fi

  # ------- 11. Update version file -------

  echo ""
  blue "Updating synced version…"
  echo "$latest_version" > "$VERSION_FILE"
  green "Version file updated to $latest_version"

  # ------- 12. Next steps -------

  echo ""
  if [[ "$mode" == "plan" ]]; then
    bold "─── Plan mode complete ───"
    echo "  Next: review the plan, then run:"
    echo "    $0 code"
  else
    bold "─── Code mode complete ───"
    echo "  Next: review the changes with:"
    echo "    git diff docs/"
    echo "  Then commit and push if everything looks right."
  fi
}

main "$@"
