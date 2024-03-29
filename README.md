# Create a JavaScript Action

[![GitHub Super-Linter](https://github.com/actions/javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/javascript-action/actions/workflows/ci.yml/badge.svg)

## How to Use this Action

The expected workflow for query updates is that changes to query files are made
through a pull request. One the pull request is merged to main, the action will
trigger an update of all queries that were edited in the PR.

Here is a sample workflow:

```yaml
name: On Merge to Main

on:
  push:
    branches: [main]

jobs:
  update-queries:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Necessary to get a complete history for diff

      - name: Install necessary tools
        run: sudo apt-get install -y jq # Installing jq for JSON processing

      - name: Get list of changed files in a specific directory
        id: get-changed-files
        run: |
          CHANGED_FILES=$(git diff --name-only ${{ github.event.before }} ${{ github.sha }} -- queries | paste -sd "," -)
          echo "CHANGED_FILES=$CHANGED_FILES" >> $GITHUB_ENV
          echo "changed_files=$CHANGED_FILES" >> $GITHUB_OUTPUT

      - name: Update Queries
        uses: bh2smith/dune-update@v0.0.0-beta.2
        with:
          changedQueries: ${{ steps.get-changed-files.outputs.changed_files }}
          duneApiKey: ${{ secrets.DUNE_API_KEY }}
```

This expects that queries are saved in `./queries/`. Note that all query file
names must be formatted as `*_{queryId}.sql`.

For a real example of this workflow in action, please visit this
[Demo Project](https://github.com/bh2smith/demo-ts-dune-client)! Specifically

- [this workflow](https://github.com/bh2smith/demo-ts-dune-client/blob/main/.github/workflows/ci.yaml)
  and
- [this successful run](https://github.com/bh2smith/demo-ts-dune-client/actions/runs/8479606867/job/23233904550)
