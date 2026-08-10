# Dune Query Updater

![CI](https://github.com/actions/javascript-action/actions/workflows/ci.yml/badge.svg)

A GitHub Action (and standalone CLI) for syncing SQL query files to
[Dune Analytics](https://dune.com). Edit queries locally, push to GitHub, and
they're updated on Dune automatically.

## Quick Start

```yaml
- uses: bh2smith/dune-update@v1
  with:
    dune-api-key: ${{ secrets.DUNE_API_KEY }}
```

That's it. The action auto-detects which `.sql` files changed and updates the
corresponding Dune queries.

## How It Works

Query files map to Dune query IDs in one of two ways:

### Filename Convention

Name files as `*_{queryId}.sql`:

```text
queries/
  daily_volume_123.sql
  user_stats_456.sql
```

### Config File (Recommended)

Place a `dune.toml` alongside your SQL:

```text
queries/
  daily_volume/
    query.sql
    dune.toml
```

```toml
[query]
id = 123
name = "daily volume"
description = "Updates dashboard metric"
```

Both approaches work side-by-side. When a `dune.toml` is present, it takes
precedence over filename parsing.

## GitHub Action

### Inputs

<!-- markdownlint-disable MD013 -->

| Input           | Required | Default                    | Description                                |
| --------------- | -------- | -------------------------- | ------------------------------------------ |
| `dune-api-key`  | Yes      | —                          | Dune API key (PLUS tier required)          |
| `query-path`    | No       | `queries`                  | Directory containing query files           |
| `changed-files` | No       | auto-detect                | Comma-separated list of changed files      |
| `api-base-url`  | No       | `https://api.dune.com/api` | Dune API base URL (e.g. a dev environment) |
| `dry-run`       | No       | `false`                    | Preview changes without updating Dune      |
| `fail-on-error` | No       | `true`                     | Fail the action if any update fails        |

<!-- markdownlint-enable MD013 -->

### Outputs

| Output              | Description                               |
| ------------------- | ----------------------------------------- |
| `updated-count`     | Number of queries successfully updated    |
| `skipped-count`     | Number of queries skipped                 |
| `updated-query-ids` | Comma-separated list of updated query IDs |

### Auto-Detection

When `changed-files` is not provided, the action detects changes automatically:

- **Pull requests**: diffs against the base branch
- **Push events**: diffs against the previous commit

This requires `fetch-depth: 0` (or sufficient depth) in your checkout step.

### Examples

#### Minimal (auto-detect changes)

```yaml
name: Update Dune Queries

on:
  push:
    branches: [main]

jobs:
  update-queries:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: bh2smith/dune-update@v1
        with:
          dune-api-key: ${{ secrets.DUNE_API_KEY }}
```

#### Dry-Run on Pull Requests

```yaml
name: Preview Dune Changes

on:
  pull_request:
    paths: [queries/**]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: bh2smith/dune-update@v1
        with:
          dune-api-key: ${{ secrets.DUNE_API_KEY }}
          dry-run: true
```

#### Explicit File List

```yaml
- name: Get changed files
  id: changed
  run: |
    FILES=$(git diff --name-only --diff-filter=ACMRT \
      ${{ github.event.before }} ${{ github.sha }} -- queries | paste -sd "," -)
    echo "files=$FILES" >> $GITHUB_OUTPUT

- uses: bh2smith/dune-update@v1
  with:
    dune-api-key: ${{ secrets.DUNE_API_KEY }}
    changed-files: ${{ steps.changed.outputs.files }}
```

### Job Summary

The action writes a summary table to the GitHub Actions UI showing the status of
each query update.

## CLI Usage

Run locally without GitHub Actions:

```bash
# Install
npm install -g dune-update-action

# Auto-detect changes (uses git diff HEAD~1)
dune-update --api-key <key>

# Explicit files
dune-update --api-key <key> --files queries/foo_123.sql,queries/bar_456.sql

# Custom query directory
dune-update --api-key <key> --query-path src/queries

# Custom diff base
dune-update --api-key <key> --base origin/main

# Target a different Dune environment (e.g. dev)
dune-update --api-key <key> --base-url https://<dev-host>/api

# Preview without updating
dune-update --api-key <key> --dry-run
```

The API key can also be set via the `DUNE_API_KEY` environment variable.

## Backwards Compatibility

The previous input names (`duneApiKey`, `changedQueries`) still work as aliases.
Existing workflows will continue to function without changes.

## Development

```bash
bun install
bun run test       # Run tests
bun run lint       # Lint
bun run all        # Format, lint, test, bundle
```

For a real example of this action in use, see the
[Demo Project](https://github.com/bh2smith/demo-ts-dune-client).
