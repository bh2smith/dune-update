import { QueryAPI } from "@duneanalytics/client-sdk";
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

export async function processUpdates(
  options: UpdateOptions,
): Promise<UpdateResult[]> {
  const { apiKey, files, dryRun = false, apiBaseUrl } = options;
  const results: UpdateResult[] = [];

  const queryManager = dryRun ? null : new QueryClient(apiKey, apiBaseUrl);

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

    if (dryRun) {
      results.push({ status: "updated", queryId: config.queryId, file });
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

      await queryManager!.updateQuery(config.queryId, updateParams);
      results.push({ status: "updated", queryId: config.queryId, file });
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
