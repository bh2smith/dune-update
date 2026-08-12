import * as core from "@actions/core";
import escapeHtml from "escape-html";
import { processUpdates } from "./dune";
import { detectChangedFiles } from "./files";
import type { UpdateResult } from "./types";

export async function run(): Promise<void> {
  try {
    const apiKey = core.getInput("dune-api-key") || core.getInput("duneApiKey");
    if (!apiKey) {
      core.setFailed("dune-api-key is required");
      return;
    }

    const queryPath = core.getInput("query-path") || "queries";
    const apiBaseUrl = core.getInput("api-base-url") || undefined;
    const dryRun = core.getInput("dry-run") === "true";
    const failOnError = core.getInput("fail-on-error") !== "false";

    let files: string[];
    const changedQueries =
      core.getInput("changed-files") || core.getInput("changedQueries");
    if (changedQueries) {
      files = changedQueries
        .split(",")
        .map(f => f.trim())
        .filter(f => f !== "");
    } else {
      core.info(`Auto-detecting changed files in '${queryPath}'...`);
      files = detectChangedFiles(queryPath);
    }

    if (files.length === 0) {
      core.info("No changed query files detected.");
      return;
    }

    if (dryRun) {
      core.info("[Dry Run] Previewing changes (no updates will be made):");
    }

    core.info(`Processing ${files.length} changed query file(s)`);
    const results = await processUpdates({ apiKey, files, dryRun, apiBaseUrl });

    const updated = results.filter(r => r.status === "updated") as Extract<
      UpdateResult,
      { status: "updated" }
    >[];
    const unchanged = results.filter(r => r.status === "unchanged");
    const skipped = results.filter(r => r.status === "skipped");
    const failed = results.filter(r => r.status === "failed");

    core.setOutput("updated-count", String(updated.length));
    core.setOutput("unchanged-count", String(unchanged.length));
    core.setOutput("skipped-count", String(skipped.length));
    core.setOutput("updated-query-ids", updated.map(r => r.queryId).join(","));

    for (const result of results) {
      switch (result.status) {
        case "updated": {
          const prefix = dryRun ? "Would update" : "Updated";
          core.info(`${prefix} query ${result.queryId} from ${result.file}`);
          if (result.readError) {
            core.warning(
              `Could not read current SQL of query ${result.queryId} (${result.readError}); ` +
                (dryRun
                  ? "the real run may fail the same way"
                  : "updated without comparing"),
            );
          }
          break;
        }
        case "unchanged":
          core.info(
            `Query ${result.queryId} already matches ${result.file}, nothing to update`,
          );
          break;
        case "skipped":
          core.warning(`Skipped ${result.file}: ${result.reason}`);
          break;
        case "failed":
          core.error(`Failed ${result.file}: ${result.error}`);
          break;
      }
    }

    await writeSummary(results, dryRun);

    if (failed.length > 0 && failOnError) {
      core.setFailed(`${failed.length} query update(s) failed`);
    }
  } catch (error) {
    core.error(error as Error);
    core.setFailed((error as Error).message);
  }
}

async function writeSummary(
  results: UpdateResult[],
  dryRun: boolean,
): Promise<void> {
  const heading = dryRun
    ? "Dune Update Summary (Dry Run)"
    : "Dune Update Summary";

  const headerRow = [
    { data: "Query ID", header: true },
    { data: "File", header: true },
    { data: "Status", header: true },
  ];

  const dataRows = results.map(r => {
    const queryId =
      r.status !== "skipped" && r.queryId ? String(r.queryId) : "-";

    const unverified =
      r.status === "updated" && r.readError ? " (current SQL unreadable)" : "";
    const status =
      r.status === "updated"
        ? (dryRun ? "Would Update" : "Updated") + unverified
        : r.status === "unchanged"
          ? "Unchanged"
          : r.status === "skipped"
            ? "Skipped"
            : "Failed";

    return [queryId, r.file, status];
  });

  const updated = results.filter(r => r.status === "updated").length;
  const unchanged = results.filter(r => r.status === "unchanged").length;
  const skipped = results.filter(r => r.status === "skipped").length;
  const failed = results.filter(r => r.status === "failed").length;

  core.summary
    .addHeading(heading)
    .addTable([headerRow, ...dataRows])
    .addRaw(
      `\n**Updated:** ${updated} | **Unchanged:** ${unchanged} | **Skipped:** ${skipped} | **Failed:** ${failed}`,
    );

  for (const result of results) {
    if (result.status === "updated" && result.diff) {
      core.summary.addDetails(
        `Diff for query ${result.queryId} (${result.file})`,
        `\n\n<pre><code>${escapeHtml(result.diff)}</code></pre>\n`,
      );
    }
  }

  await core.summary.write();
}
