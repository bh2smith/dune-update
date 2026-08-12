import { QueryAPI } from "@duneanalytics/client-sdk";
import { createTwoFilesPatch } from "diff";
import type { UpdateResult, UpdateOptions } from "./types";
import { resolveQueryConfig, readQueryFile } from "./files";

export const DEFAULT_API_BASE_URL = "https://api.dune.com/api";

// The SDK hardcodes its base URL; all requests are routed through `url()`,
// so overriding it is enough to target another environment (e.g. dev).
export class QueryClient extends QueryAPI {
  constructor(
    apiKey: string,
    private baseUrl: string = DEFAULT_API_BASE_URL,
  ) {
    super(apiKey);
  }

  override url(route?: string): string {
    return `${this.baseUrl}/v1/${route}`;
  }
}

function normalizeSql(sql: string): string {
  return sql.replace(/\r\n/g, "\n").trim();
}

// The SDK's DuneError only exposes the HTTP status inside the message text
// ("HTTP - Status: 429, Message: ..."); network failures are prefixed with
// "Response ".
function isTransientError(error: Error): boolean {
  return (
    /HTTP - Status: (429|5\d\d),/.test(error.message) ||
    error.message.startsWith("Response ")
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const { retries = 2, baseDelayMs = 1000 } = options;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !isTransientError(error as Error)) throw error;
      await new Promise(resolve =>
        setTimeout(resolve, baseDelayMs * 2 ** attempt),
      );
    }
  }
}

export async function processUpdates(
  options: UpdateOptions,
): Promise<UpdateResult[]> {
  const { apiKey, files, dryRun = false, apiBaseUrl } = options;
  const results: UpdateResult[] = [];

  const queryManager = new QueryClient(apiKey, apiBaseUrl);

  for (const file of files) {
    const config = resolveQueryConfig(file);
    if (!config) {
      results.push({
        status: "failed",
        file,
        error: `Could not resolve query ID from '${file}': use '*_{queryId}.sql' naming or add a dune.toml`,
      });
      continue;
    }

    const querySql = readQueryFile(file);
    if (!querySql) {
      results.push({
        status: "skipped",
        file,
        reason: "File is empty or deleted",
      });
      continue;
    }

    // Comparison against the current query is best-effort: if the read
    // fails we still attempt the update rather than blocking it, but the
    // failure is surfaced on the result so previews aren't silently blind.
    let currentSql: string | null;
    let readError: string | undefined;
    try {
      currentSql = (
        await withRetry(() => queryManager.readQuery(config.queryId))
      ).query_sql;
    } catch (error) {
      currentSql = null;
      readError = (error as Error).message;
    }

    if (
      currentSql !== null &&
      normalizeSql(currentSql) === normalizeSql(querySql)
    ) {
      results.push({ status: "unchanged", queryId: config.queryId, file });
      continue;
    }

    const diff =
      currentSql !== null
        ? createTwoFilesPatch(
            `query-${config.queryId} (dune)`,
            file,
            normalizeSql(currentSql) + "\n",
            normalizeSql(querySql) + "\n",
          )
        : undefined;

    if (dryRun) {
      results.push({
        status: "updated",
        queryId: config.queryId,
        file,
        diff,
        readError,
      });
      continue;
    }

    try {
      const updateParams: {
        query_sql: string;
        name?: string;
        description?: string;
      } = {
        query_sql: querySql,
      };
      if (config.name) updateParams.name = config.name;
      if (config.description) updateParams.description = config.description;

      await withRetry(() =>
        queryManager.updateQuery(config.queryId, updateParams),
      );
      results.push({
        status: "updated",
        queryId: config.queryId,
        file,
        diff,
        readError,
      });
    } catch (error) {
      results.push({
        status: "failed",
        queryId: config.queryId,
        file,
        error: (error as Error).message,
      });
    }
  }

  return results;
}
