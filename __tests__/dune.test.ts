import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { processUpdates, withRetry, QueryClient } from "../src/dune";
import { QueryAPI } from "@duneanalytics/client-sdk";

vi.spyOn(QueryAPI.prototype, "updateQuery").mockImplementation(
  () => Promise.resolve() as never,
);

// Default: current query text is unavailable, so comparison is skipped
// and every changed file results in an update attempt.
vi.spyOn(QueryAPI.prototype, "readQuery").mockImplementation(
  () => Promise.reject(new Error("not found")) as never,
);

function mockCurrentSql(sql: string): void {
  vi.spyOn(QueryAPI.prototype, "readQuery").mockResolvedValueOnce({
    query_sql: sql,
  } as never);
}

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
      readError: "not found",
    });
    expect(results[1]).toEqual({
      status: "updated",
      queryId: 871114,
      file: "queries/query_871114.sql",
      readError: "not found",
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

  it("handles dry run without calling updateQuery", async () => {
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
        readError: "not found",
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

  it("reports unchanged when Dune already has the same SQL", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dune-test-"));
    try {
      const sqlPath = join(tempDir, "query_42.sql");
      writeFileSync(sqlPath, "SELECT 1\n");
      mockCurrentSql("SELECT 1\r\n");

      const results = await processUpdates({
        apiKey: "test-key",
        files: [sqlPath],
      });

      expect(results).toEqual([
        { status: "unchanged", queryId: 42, file: sqlPath },
      ]);
      expect(QueryAPI.prototype.updateQuery).not.toHaveBeenCalled();
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });

  it("includes a diff when the query text differs", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dune-test-"));
    try {
      const sqlPath = join(tempDir, "query_42.sql");
      writeFileSync(sqlPath, "SELECT 2");
      mockCurrentSql("SELECT 1");

      const results = await processUpdates({
        apiKey: "test-key",
        files: [sqlPath],
      });

      expect(results).toHaveLength(1);
      const result = results[0];
      expect(result.status).toBe("updated");
      if (result.status === "updated") {
        expect(result.diff).toContain("-SELECT 1");
        expect(result.diff).toContain("+SELECT 2");
      }
      expect(QueryAPI.prototype.updateQuery).toHaveBeenCalledTimes(1);
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });

  it("dry run compares against Dune and reports the diff", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dune-test-"));
    try {
      const sqlPath = join(tempDir, "query_42.sql");
      writeFileSync(sqlPath, "SELECT 2");
      mockCurrentSql("SELECT 1");

      const results = await processUpdates({
        apiKey: "test-key",
        files: [sqlPath],
        dryRun: true,
      });

      expect(results).toHaveLength(1);
      const result = results[0];
      expect(result.status).toBe("updated");
      if (result.status === "updated") {
        expect(result.diff).toContain("-SELECT 1");
      }
      expect(QueryAPI.prototype.updateQuery).not.toHaveBeenCalled();
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });

  it("surfaces the read failure on dry-run results", async () => {
    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/query_3570870.sql"],
      dryRun: true,
    });

    expect(results[0]).toMatchObject({
      status: "updated",
      readError: "not found",
    });
    expect(results[0]).not.toHaveProperty("diff", expect.any(String));
  });

  it("still updates when the current query cannot be read", async () => {
    const results = await processUpdates({
      apiKey: "test-key",
      files: ["queries/query_3570870.sql"],
    });

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("updated");
    expect(results[0]).not.toHaveProperty("diff", expect.any(String));
    expect(QueryAPI.prototype.updateQuery).toHaveBeenCalledTimes(1);
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
        {
          status: "updated",
          queryId: 42,
          file: sqlPath,
          readError: "not found",
        },
      ]);
      expect(QueryAPI.prototype.updateQuery).toHaveBeenCalledWith(42, {
        query_sql: "SELECT 1",
      });
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });
});

describe("withRetry", () => {
  it("retries transient errors until success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("HTTP - Status: 429, Message: rate limited"),
      )
      .mockRejectedValueOnce(
        new Error("HTTP - Status: 503, Message: unavailable"),
      )
      .mockResolvedValueOnce("ok");

    await expect(withRetry(fn, { baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("retries network failures", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("Response TypeError: fetch failed"))
      .mockResolvedValueOnce("ok");

    await expect(withRetry(fn, { baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-transient errors", async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new Error("HTTP - Status: 400, Message: bad input"));

    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow("400");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up after the configured number of retries", async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new Error("HTTP - Status: 500, Message: boom"));

    await expect(withRetry(fn, { retries: 2, baseDelayMs: 1 })).rejects.toThrow(
      "500",
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
