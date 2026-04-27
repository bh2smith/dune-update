import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  extractQueryId,
  readQueryFile,
  readDuneToml,
  resolveQueryConfig,
} from "../src/files";

describe("extractQueryId", () => {
  it("extracts query ID from standard filename", () => {
    expect(extractQueryId("queries/query_123.sql")).toBe(123);
  });

  it("extracts query ID from filename with prefix", () => {
    expect(extractQueryId("queries/daily_volume_456.sql")).toBe(456);
  });

  it("returns null for invalid filename", () => {
    expect(extractQueryId("queries/invalid.sql")).toBeNull();
  });

  it("returns null for non-sql file", () => {
    expect(extractQueryId("queries/query_123.txt")).toBeNull();
  });

  it("handles large query IDs", () => {
    expect(extractQueryId("queries/query_3570870.sql")).toBe(3570870);
  });
});

describe("readQueryFile", () => {
  it("reads existing file content", () => {
    expect(readQueryFile("queries/query_3570870.sql")).toContain("select");
  });

  it("returns empty string for non-existent file", () => {
    expect(readQueryFile("queries/nonexistent.sql")).toBe("");
  });
});

describe("readDuneToml", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "dune-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it("reads valid dune.toml", () => {
    writeFileSync(
      join(tempDir, "dune.toml"),
      '[query]\nid = 123\nname = "test query"\ndescription = "a test"',
    );
    const sqlPath = join(tempDir, "query.sql");

    const config = readDuneToml(sqlPath);
    expect(config).toEqual({
      queryId: 123,
      name: "test query",
      description: "a test",
    });
  });

  it("reads dune.toml with only id", () => {
    writeFileSync(join(tempDir, "dune.toml"), "[query]\nid = 456");
    const sqlPath = join(tempDir, "query.sql");

    const config = readDuneToml(sqlPath);
    expect(config).toEqual({
      queryId: 456,
      name: undefined,
      description: undefined,
    });
  });

  it("returns null when no dune.toml exists", () => {
    const sqlPath = join(tempDir, "query.sql");
    expect(readDuneToml(sqlPath)).toBeNull();
  });

  it("returns null for invalid toml", () => {
    writeFileSync(join(tempDir, "dune.toml"), "not valid toml {{{}");
    const sqlPath = join(tempDir, "query.sql");
    expect(readDuneToml(sqlPath)).toBeNull();
  });

  it("returns null when query.id is missing", () => {
    writeFileSync(join(tempDir, "dune.toml"), '[query]\nname = "no id"');
    const sqlPath = join(tempDir, "query.sql");
    expect(readDuneToml(sqlPath)).toBeNull();
  });
});

describe("resolveQueryConfig", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "dune-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it("prefers dune.toml over filename convention", () => {
    writeFileSync(join(tempDir, "dune.toml"), "[query]\nid = 999");
    const sqlPath = join(tempDir, "query_123.sql");

    const config = resolveQueryConfig(sqlPath);
    expect(config).toEqual({ queryId: 999, file: sqlPath });
  });

  it("falls back to filename when no dune.toml", () => {
    const config = resolveQueryConfig("queries/query_123.sql");
    expect(config).toEqual({ queryId: 123, file: "queries/query_123.sql" });
  });

  it("returns null when neither works", () => {
    expect(resolveQueryConfig("queries/invalid.sql")).toBeNull();
  });
});
