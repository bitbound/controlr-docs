#!/usr/bin/env bash

set -euo pipefail

if [[ "$#" -gt 1 ]]; then
  echo "Usage: $0 [target-version]" >&2
  exit 1
fi

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
version_file="$repo_root/controlr-version.txt"
target_version="${1:-}"

if [[ -z "$target_version" ]]; then
  command -v curl >/dev/null || {
    echo "curl is required when no target version is provided." >&2
    exit 1
  }
  command -v jq >/dev/null || {
    echo "jq is required when no target version is provided." >&2
    exit 1
  }

  target_version=$(curl --fail --silent --show-error \
    https://api.github.com/repos/bitbound/ControlR/releases/latest \
    | jq -r '.tag_name')
fi

if [[ -z "$target_version" || "$target_version" == "null" ]]; then
  echo "Could not determine the ControlR version." >&2
  exit 1
fi

current_version=$(tr -d '[:space:]' < "$version_file" 2>/dev/null || true)
if [[ "$current_version" == "$target_version" ]]; then
  echo "Version file already reads $target_version. Nothing to do."
  exit 0
fi

printf '%s\n' "$target_version" > "$version_file"
echo "Synced $current_version -> $target_version"