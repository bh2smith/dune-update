import { describe, it, expect, vi, beforeEach } from "vitest";
import * as core from "@actions/core";
import * as main from "../src/main";
import { QueryAPI } from "@duneanalytics/client-sdk";

const infoMock = vi.spyOn(core, "info").mockImplementation(() => {});
const getInputMock = vi.spyOn(core, "getInput").mockImplementation(() => "");
const setFailedMock = vi.spyOn(core, "setFailed").mockImplementation(() => {});
const setOutputMock = vi.spyOn(core, "setOutput").mockImplementation(() => {});

const runMock = vi.spyOn(main, "run");
vi.spyOn(QueryAPI.prototype, "updateQuery").mockImplementation(
  () => Promise.resolve() as never,
);

describe("action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs successfully with 2 changed files", async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "changedQueries":
          return "queries/query_3570870.sql,queries/query_871114.sql";
        case "duneApiKey":
          return "FakeAPIKey";
        default:
          return "";
      }
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(infoMock).toHaveBeenNthCalledWith(1, "Updating 2 changed queries");
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      "Updating query with ID 3570870",
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      "Updating query with ID 871114",
    );
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      "output",
      "Unsure what this output should be",
    );
  });

  it("logs and returns with no changed files", async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "duneApiKey":
          return "FAKE_KEY";
        default:
          return "";
      }
    });
    await main.run();
    expect(runMock).toHaveReturned();

    expect(infoMock).toHaveBeenNthCalledWith(1, "No changed files provided.");
  });

  it("sets a failed status", async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "changedQueries":
          return "NonExistantFile.sql";
        case "duneApiKey":
          return "FAKE_KEY";
        default:
          return "";
      }
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      "Couldn't extract queryID from filePath 'NonExistantFile.sql': must be formatted as '*_{queryId}.sql'",
    );
  });
});
