import { processUpdates } from "./dune";
import { detectChangedFiles } from "./files";

interface CliArgs {
  apiKey: string;
  files: string[];
  queryPath: string;
  base?: string;
  dryRun: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let apiKey = process.env.DUNE_API_KEY || "";
  let files: string[] = [];
  let queryPath = "queries";
  let base: string | undefined;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--api-key":
        apiKey = args[++i];
        break;
      case "--files":
      case "--changed":
        files = args[++i].split(",");
        break;
      case "--query-path":
        queryPath = args[++i];
        break;
      case "--base":
        base = args[++i];
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
    }
  }

  if (!apiKey) {
    console.error(
      "Error: API key required. Use --api-key or set DUNE_API_KEY env var.",
    );
    process.exit(1);
  }

  return { apiKey, files, queryPath, base, dryRun };
}

function printUsage(): void {
  console.log(`
Usage: dune-update [options]

Options:
  --api-key <key>      Dune API key (or set DUNE_API_KEY env var)
  --files <paths>      Comma-separated list of changed query files
  --query-path <dir>   Directory containing queries (default: queries)
  --base <ref>         Git ref to diff against (default: HEAD~1)
  --dry-run            Preview changes without executing updates
  -h, --help           Show this help message

Examples:
  dune-update --api-key <key> --files queries/foo_123.sql
  dune-update --query-path queries --dry-run
  DUNE_API_KEY=<key> dune-update --query-path queries
`);
}

async function main(): Promise<void> {
  const { apiKey, files: explicitFiles, queryPath, base, dryRun } = parseArgs();

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
  const results = await processUpdates({ apiKey, files, dryRun });

  let hasFailures = false;
  for (const result of results) {
    switch (result.status) {
      case "updated": {
        const prefix = dryRun ? "Would update" : "Updated";
        console.log(`  ${prefix} query ${result.queryId} from ${result.file}`);
        break;
      }
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
  const skipped = results.filter(r => r.status === "skipped").length;
  const failed = results.filter(r => r.status === "failed").length;
  console.log(
    `\nResults: ${updated} updated, ${skipped} skipped, ${failed} failed`,
  );

  if (hasFailures) process.exit(1);
}

main();
