#!/usr/bin/env bash
set -euo pipefail

web_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_root="${DRUSNIEL_CLOD_SOURCE:-$(dirname "$web_root")/drusniel-voxels-bevy/tools/clod-poc}"
dry_run=0
windows_git_root=""
windows_safe_directory=""

if [[ -n "${WSL_DISTRO_NAME:-}" ]] && command -v git.exe >/dev/null 2>&1; then
  windows_git_root="//wsl.localhost/$WSL_DISTRO_NAME$web_root"
  windows_safe_directory="%(prefix)/$windows_git_root"
fi

usage() {
  cat <<'EOF'
Usage: scripts/sync-from-bevy.sh [--dry-run] [source]

Copy newer code and configuration files from tools/clod-poc into this web repo.
Markdown, documentation, generated output, screenshots, and binary assets are skipped.
Source working-tree changes are copied regardless of timestamp.
Destination working-tree changes are never overwritten.

The source defaults to:
  ../drusniel-voxels-bevy/tools/clod-poc

Set DRUSNIEL_CLOD_SOURCE or pass a source path to override it.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      source_root="$1"
      ;;
  esac
  shift
done

if [[ ! -d "$source_root" ]]; then
  echo "Source directory does not exist: $source_root" >&2
  exit 1
fi

source_repo="$(git -C "$source_root" rev-parse --show-toplevel 2>/dev/null || true)"
source_repo_prefix=""
if [[ -n "$source_repo" && "$source_root" == "$source_repo/"* ]]; then
  source_repo_prefix="${source_root#"$source_repo"/}/"
fi

is_code_or_config() {
  case "$1" in
    *.ts|*.tsx|*.mts|*.cts|*.js|*.jsx|*.mjs|*.cjs|*.json|*.jsonc|\
    *.yaml|*.yml|*.wgsl|*.glsl|*.vert|*.frag|*.comp|*.css|*.scss|\
    *.html|*.sh|*.ps1|*.toml)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_excluded() {
  case "$1" in
    .git/*|node_modules/*|dist/*|coverage/*|docs/*|qa-runs/*|shots/*|\
    test-results/*|playwright-report/*|*.md)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

copied=0
unchanged=0
locally_modified=0
not_newer=0

destination_has_local_changes() {
  local relative="$1"
  local destination="$web_root/$relative"
  local index_entry
  local index_mode
  local index_hash
  local worktree_hash

  if [[ -n "$(git -C "$web_root" status --porcelain=1 --untracked-files=all -- "$relative" \
    </dev/null 2>/dev/null)" ]]; then
    return 0
  fi

  if [[ -n "$windows_git_root" ]] &&
     [[ -n "$(git.exe -c "safe.directory=$windows_safe_directory" -C "$windows_git_root" \
       status --porcelain=1 --untracked-files=all -- "$relative" </dev/null 2>/dev/null)" ]]; then
    return 0
  fi

  index_entry="$(git -C "$web_root" ls-files -s -- "$relative" </dev/null)"
  if [[ -z "$index_entry" ]]; then
    return 1
  fi

  read -r index_mode index_hash _ <<<"$index_entry"
  worktree_hash="$(git -C "$web_root" hash-object -- "$destination" </dev/null)"
  if [[ "$worktree_hash" != "$index_hash" ]]; then
    return 0
  fi

  if [[ "$index_mode" == "100755" && ! -x "$destination" ]] ||
     [[ "$index_mode" != "100755" && -x "$destination" ]]; then
    return 0
  fi

  return 1
}

source_has_local_changes() {
  local relative="$1"

  [[ -n "$source_repo" ]] &&
    [[ -n "$(git -C "$source_repo" status --porcelain=1 --untracked-files=all -- \
      "$source_repo_prefix$relative" </dev/null 2>/dev/null)" ]]
}

while IFS= read -r -d '' source_file; do
  relative="${source_file#"$source_root"/}"

  if is_excluded "$relative" || ! is_code_or_config "$relative"; then
    continue
  fi

  destination_file="$web_root/$relative"

  if [[ -f "$destination_file" ]] && cmp -s -- "$source_file" "$destination_file"; then
    unchanged=$((unchanged + 1))
    continue
  fi

  if destination_has_local_changes "$relative"; then
    printf 'SKIP  %s (destination has local changes)\n' "$relative"
    locally_modified=$((locally_modified + 1))
    continue
  fi

  if [[ -e "$destination_file" ]] &&
     ! source_has_local_changes "$relative" &&
     [[ ! "$source_file" -nt "$destination_file" ]]; then
    printf 'SKIP  %s (destination is newer or same age)\n' "$relative"
    not_newer=$((not_newer + 1))
    continue
  fi

  if [[ "$dry_run" -eq 1 ]]; then
    printf 'WOULD COPY  %s\n' "$relative"
  else
    mkdir -p "$(dirname "$destination_file")"
    cp -p -- "$source_file" "$destination_file"
    printf 'COPIED  %s\n' "$relative"
  fi
  copied=$((copied + 1))
done < <(find "$source_root" -type f -print0)

printf '\nSummary: %d %s, %d unchanged, %d locally modified, %d skipped because destination was not older.\n' \
  "$copied" "$([[ "$dry_run" -eq 1 ]] && printf 'to copy' || printf 'copied')" \
  "$unchanged" "$locally_modified" "$not_newer"
