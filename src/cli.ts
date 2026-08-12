import { parseArgs as parseArgv } from "node:util";
import { processUpdates } from "./dune";
import { detectChangedFiles } from "./files";

interface CliArgs {
  apiKey: string;
  files: string[];
  queryPath: string;
  base?: string;
  dryRun: boolean;
  apiBaseUrl?: string;
}

function parseArgs(): CliArgs {
  let values: {
    "api-key"?: string;
    files?: string;
    changed?: string;
    "query-path": string;
    base?: string;
    "base-url"?: string;
    "dry-run": boolean;
    help: boolean;
  };

  try {
    ({ values } = parseArgv({
      options: {
        "api-key": { type: "string" },
        files: { type: "string" },
        changed: { type: "string" },
        "query-path": { type: "string", default: "queries" },
        base: { type: "string" },
        "base-url": { type: "string" },
        "dry-run": { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
    }));
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    printUsage();
    process.exit(1);
  }

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  const apiKey = values["api-key"] || process.env.DUNE_API_KEY || "";
  if (!apiKey) {
    console.error(
      "Error: API key required. Use --api-key or set DUNE_API_KEY env var.",
    );
    process.exit(1);
  }

  const fileList = values.files ?? values.changed;
  return {
    apiKey,
    files: fileList ? fileList.split(",") : [],
    queryPath: values["query-path"],
    base: values.base,
    dryRun: values["dry-run"],
    apiBaseUrl: values["base-url"],
  };
}

function printUsage(): void {
  console.log(`
Usage: dune-update [options]

Options:
  --api-key <key>      Dune API key (or set DUNE_API_KEY env var)
  --files <paths>      Comma-separated list of changed query files
  --query-path <dir>   Directory containing queries (default: queries)
  --base <ref>         Git ref to diff against (default: HEAD~1)
  --base-url <url>     Dune API base URL (default: https://api.dune.com/api)
  --dry-run            Preview changes without executing updates
  -h, --help           Show this help message

Examples:
  dune-update --api-key <key> --files queries/foo_123.sql
  dune-update --query-path queries --dry-run
  DUNE_API_KEY=<key> dune-update --query-path queries
`);
}

async function main(): Promise<void> {
  const {
    apiKey,
    files: explicitFiles,
    queryPath,
    base,
    dryRun,
    apiBaseUrl,
  } = parseArgs();

  const files =
    explicitFiles.length > 0
      ? explicitFiles
      : detectChangedFiles(queryPath, base);

  if (files.length === 0) {
    console.log("No changed query files detected.");
    return;
  }

  if (dryRun) {
    console.log("[Dry Run] Previewing changes (no updates will be made):\n");
  }

  console.log(`Processing ${files.length} changed query file(s)\n`);
  const results = await processUpdates({ apiKey, files, dryRun, apiBaseUrl });

  let hasFailures = false;
  for (const result of results) {
    switch (result.status) {
      case "updated": {
        const prefix = dryRun ? "Would update" : "Updated";
        console.log(`  ${prefix} query ${result.queryId} from ${result.file}`);
        if (result.readError) {
          console.log(`    (could not read current SQL: ${result.readError})`);
        }
        if (dryRun && result.diff) {
          console.log(result.diff.replace(/^/gm, "    "));
        }
        break;
      }
      case "unchanged":
        console.log(
          `  Unchanged query ${result.queryId} (${result.file} matches Dune)`,
        );
        break;
      case "skipped":
        console.log(`  Skipped ${result.file}: ${result.reason}`);
        break;
      case "failed":
        console.log(`  Failed ${result.file}: ${result.error}`);
        hasFailures = true;
        break;
    }
  }

  const updated = results.filter(r => r.status === "updated").length;
  const unchanged = results.filter(r => r.status === "unchanged").length;
  const skipped = results.filter(r => r.status === "skipped").length;
  const failed = results.filter(r => r.status === "failed").length;
  console.log(
    `\nResults: ${updated} updated, ${unchanged} unchanged, ${skipped} skipped, ${failed} failed`,
  );

  if (hasFailures) process.exit(1);
}

main();
