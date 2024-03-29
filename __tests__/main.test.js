/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require("@actions/core");
const main = require("../src/main");
const { QueryAPI } = require("@duneanalytics/client-sdk");

// Mock the GitHub Actions core library
const infoMock = jest.spyOn(core, "info").mockImplementation();
const getInputMock = jest.spyOn(core, "getInput").mockImplementation();
const setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
const setOutputMock = jest.spyOn(core, "setOutput").mockImplementation();

// Mock the action's main function
const runMock = jest.spyOn(main, "run");
jest.spyOn(QueryAPI.prototype, "updateQuery").mockImplementation(v => {
  return Promise.resolve(v);
});

describe("action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("runs successfully with 2 changed files", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
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

    // Verify that all of the core library functions were called correctly
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
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case "duneApiKey":
          return "FAKE_KEY";
        default:
          return "";
      }
    });
    await main.run();
    expect(runMock).toHaveReturned();

    // Verify that all of the core library functions were called correctly
    expect(infoMock).toHaveBeenNthCalledWith(1, "No changed files provided.");
  });

  it("sets a failed status", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
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

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      "Couldn't read query file: Error: ENOENT: no such file or directory, open 'NonExistantFile.sql'",
    );
    expect(setFailedMock).toHaveBeenNthCalledWith(
      2,
      "Couldn't extract queryID from filePath 'NonExistantFile.sql': must be formatted as '*_{queryId}.sql'",
    );
  });
});
