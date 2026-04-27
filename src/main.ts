import * as core from "@actions/core";
import { readFileSync } from "node:fs";
import { QueryAPI } from "@duneanalytics/client-sdk";

function extractQueryId(name: string): number | null {
  const match = name.match(/_(\d+)\.sql$/);
  if (!match) {
    const errorMessage = `Couldn't extract queryID from filePath '${name}': must be formatted as '*_{queryId}.sql'`;
    core.error(errorMessage);
    core.setFailed(errorMessage);
    return null;
  }
  return parseInt(match[1], 10);
}

function readQueryFile(name: string): string {
  try {
    return readFileSync(name, { encoding: "utf8" });
  } catch {
    return "";
  }
}

export async function run(): Promise<void> {
  try {
    const queryManager = new QueryAPI(
      core.getInput("duneApiKey", { required: true }),
    );
    const changedFiles = core.getInput("changedQueries").split(",");
    if (changedFiles[0] === "") {
      core.info("No changed files provided.");
      return;
    }

    interface QueryUpdate {
      queryId: number;
      query_sql: string;
    }

    const updates: QueryUpdate[] = [];
    for (const fileName of changedFiles) {
      const queryId = extractQueryId(fileName);
      if (queryId === null) continue;
      const query_sql = readQueryFile(fileName);
      if (query_sql === "") {
        core.warning(`Skipping (deleted) file ${fileName}`);
        continue;
      }
      updates.push({ queryId, query_sql });
    }

    if (updates.length === 0) {
      core.info("No detected update files.");
      return;
    }

    core.info(`Updating ${changedFiles.length} changed queries`);
    for (const { queryId, query_sql } of updates) {
      try {
        core.info(`Updating query with ID ${queryId}`);
        await queryManager.updateQuery(queryId, { query_sql });
      } catch (error) {
        core.setFailed((error as Error).message);
      }
    }

    core.setOutput("output", "Unsure what this output should be");
  } catch (error) {
    core.error(error as Error);
    core.setFailed((error as Error).message);
  }
}
