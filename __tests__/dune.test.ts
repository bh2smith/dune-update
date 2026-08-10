import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { processUpdates, QueryClient } from "../src/dune";
import { QueryAPI } from "@duneanalytics/client-sdk";

vi.spyOn(QueryAPI.prototype, "updateQuery").mockImplementation(
  () => Promise.resolve() as never,
);

describe("processUpdates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates queries from standard filenames", async () => {
    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/query_3570870.sql", "queries/query_871114.sql"],
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      status: "updated",
      queryId: 3570870,
      file: "queries/query_3570870.sql",
    });
    expect(results[1]).toEqual({
      status: "updated",
      queryId: 871114,
      file: "queries/query_871114.sql",
    });
    expect(QueryAPI.prototype.updateQuery).toHaveBeenCalledTimes(2);
  });

  it("returns failed result for invalid filenames", async () => {
    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/invalid.sql"],
    });

    expect(results).toEqual([
      {
        status: "failed",
        file: "queries/invalid.sql",
        error: expect.stringContaining("Could not resolve query ID"),
      },
    ]);
  });

  it("skips deleted/empty files", async () => {
    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/nonexistent_123.sql"],
    });

    expect(results).toEqual([
      {
        status: "skipped",
        file: "queries/nonexistent_123.sql",
        reason: "File is empty or deleted",
      },
    ]);
  });

  it("handles dry run without calling API", async () => {
    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/query_3570870.sql"],
      dryRun: true,
    });

    expect(results).toEqual([
      {
        status: "updated",
        queryId: 3570870,
        file: "queries/query_3570870.sql",
      },
    ]);
    expect(QueryAPI.prototype.updateQuery).not.toHaveBeenCalled();
  });

  it("captures API errors as failed results", async () => {
    vi.spyOn(QueryAPI.prototype, "updateQuery").mockRejectedValueOnce(
      new Error("API rate limit"),
    );

    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/query_3570870.sql"],
    });

    expect(results).toEqual([
      {
        status: "failed",
        queryId: 3570870,
        file: "queries/query_3570870.sql",
        error: "API rate limit",
      },
    ]);
  });

  it("continues processing after individual failures", async () => {
    vi.spyOn(QueryAPI.prototype, "updateQuery")
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(undefined as never);

    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/query_3570870.sql", "queries/query_871114.sql"],
    });

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("failed");
    expect(results[1].status).toBe("updated");
  });

  it("routes requests through a custom API base URL", () => {
    const client = new QueryClient("test-key", "https://dev.example.com/api");
    expect(client.url("query/42/update")).toBe(
      "https://dev.example.com/api/v1/query/42/update",
    );
  });

  it("defaults to the production API base URL", () => {
    const client = new QueryClient("test-key");
    expect(client.url("query/42")).toBe("https://api.dune.com/api/v1/query/42");
  });

  it("reads config from dune.toml when present", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dune-test-"));
    try {
      writeFileSync(join(tempDir, "dune.toml"), "[query]\nid = 42");
      const sqlPath = join(tempDir, "query.sql");
      writeFileSync(sqlPath, "SELECT 1");

      const results = await processUpdates({
        apiKey: "test-key",
        files: [sqlPath],
      });

      expect(results).toEqual([
        { status: "updated", queryId: 42, file: sqlPath },
      ]);
      expect(QueryAPI.prototype.updateQuery).toHaveBeenCalledWith(42, {
        query_sql: "SELECT 1",
      });
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });
});
