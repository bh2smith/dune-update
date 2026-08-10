import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@actions/core", () => ({
  info: vi.fn(),
  getInput: vi.fn(),
  setFailed: vi.fn(),
  setOutput: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  summary: {
    addHeading: vi.fn().mockReturnThis(),
    addTable: vi.fn().mockReturnThis(),
    addRaw: vi.fn().mockReturnThis(),
    addDetails: vi.fn().mockReturnThis(),
    write: vi.fn().mockResolvedValue(undefined),
  },
}));

import * as core from "@actions/core";
import * as action from "../src/github-action";
import { QueryAPI } from "@duneanalytics/client-sdk";

const getInputMock = core.getInput as Mock;
const infoMock = core.info as Mock;
const setFailedMock = core.setFailed as Mock;
const setOutputMock = core.setOutput as Mock;
const warningMock = core.warning as Mock;

vi.spyOn(QueryAPI.prototype, "updateQuery").mockImplementation(
  () => Promise.resolve() as never,
);

// Current query text is unavailable, so every changed file is updated.
vi.spyOn(QueryAPI.prototype, "readQuery").mockImplementation(
  () => Promise.reject(new Error("not found")) as never,
);

function mockInputs(inputs: Record<string, string>) {
  getInputMock.mockImplementation((name: string) => inputs[name] || "");
}

describe("github action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates queries with new input names", async () => {
    mockInputs({
      "dune-api-key": "test-key",
      "changed-files": "queries/query_3570870.sql,queries/query_871114.sql",
    });

    await action.run();

    expect(infoMock).toHaveBeenCalledWith("Processing 2 changed query file(s)");
    expect(infoMock).toHaveBeenCalledWith(
      "Updated query 3570870 from queries/query_3570870.sql",
    );
    expect(infoMock).toHaveBeenCalledWith(
      "Updated query 871114 from queries/query_871114.sql",
    );
    expect(setOutputMock).toHaveBeenCalledWith("updated-count", "2");
    expect(setOutputMock).toHaveBeenCalledWith(
      "updated-query-ids",
      "3570870,871114",
    );
  });

  it("supports deprecated input names for backwards compatibility", async () => {
    mockInputs({
      duneApiKey: "test-key",
      changedQueries: "queries/query_3570870.sql",
    });

    await action.run();

    expect(infoMock).toHaveBeenCalledWith(
      "Updated query 3570870 from queries/query_3570870.sql",
    );
  });

  it("exits gracefully with no changed files", async () => {
    mockInputs({ "dune-api-key": "test-key" });

    await action.run();

    expect(infoMock).toHaveBeenCalledWith(
      expect.stringContaining("Auto-detecting"),
    );
  });

  it("fails when no API key provided", async () => {
    mockInputs({});

    await action.run();

    expect(setFailedMock).toHaveBeenCalledWith("dune-api-key is required");
  });

  it("handles dry run mode", async () => {
    mockInputs({
      "dune-api-key": "test-key",
      "changed-files": "queries/query_3570870.sql",
      "dry-run": "true",
    });

    await action.run();

    expect(infoMock).toHaveBeenCalledWith(
      "[Dry Run] Previewing changes (no updates will be made):",
    );
    expect(infoMock).toHaveBeenCalledWith(
      "Would update query 3570870 from queries/query_3570870.sql",
    );
    expect(QueryAPI.prototype.updateQuery).not.toHaveBeenCalled();
  });

  it("respects fail-on-error: false", async () => {
    vi.spyOn(QueryAPI.prototype, "updateQuery").mockRejectedValueOnce(
      new Error("API error"),
    );

    mockInputs({
      "dune-api-key": "test-key",
      "changed-files": "queries/query_3570870.sql",
      "fail-on-error": "false",
    });

    await action.run();

    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("warns on skipped files", async () => {
    mockInputs({
      "dune-api-key": "test-key",
      "changed-files": "queries/nonexistent_123.sql",
    });

    await action.run();

    expect(warningMock).toHaveBeenCalledWith(
      expect.stringContaining("Skipped"),
    );
    expect(setOutputMock).toHaveBeenCalledWith("skipped-count", "1");
  });

  it("writes job summary", async () => {
    mockInputs({
      "dune-api-key": "test-key",
      "changed-files": "queries/query_3570870.sql",
    });

    await action.run();

    expect(core.summary.addHeading).toHaveBeenCalledWith("Dune Update Summary");
    expect(core.summary.addTable).toHaveBeenCalled();
    expect(core.summary.write).toHaveBeenCalled();
  });
});
