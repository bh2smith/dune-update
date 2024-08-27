const core = require("@actions/core");
const fs = require("fs");
const { QueryAPI } = require("@duneanalytics/client-sdk");

function extractQueryId(name) {
  const match = name.match(/_(\d+)\.sql$/);

  // Extract the numeric value if a match is found
  const numericValue = match ? match[1] : null;
  if (numericValue === null) {
    const errorMessage = `Couldn't extract queryID from filePath '${name}': must be formatted as '*_{queryId}.sql'`;
    core.error(errorMessage);
    core.setFailed(errorMessage);
  }
  return parseInt(numericValue);
}

function readQueryFile(name) {
  try {
    return fs.readFileSync(name, { encoding: "utf8" });
  } catch (error) {
    const errorMessage = `Couldn't read query file: ${error}`;
    core.error(errorMessage);
    core.setFailed(errorMessage);
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const queryManager = new QueryAPI(
      core.getInput("duneApiKey", { required: true }),
    );
    // getInput "Returns an empty string if the value is not defined."
    // so this will be [ "" ] when no files are provided.
    const changedFiles = core.getInput("changedQueries").split(",");
    if (changedFiles[0] === "") {
      core.info("No changed files provided.");
      return;
    }
    const updates = changedFiles
      .map(fileName => {
        const query_sql = readQueryFile(fileName);
        const queryId = extractQueryId(fileName);
        if (query_sql === "") {
          core.warn(`Skipping (deleted) file ${fileName}`);
          return null;
        }
        /// TODO - read additional data from queryconf.toml
        return { queryId, query_sql };
      })
      .filter(update => update === null);
    core.info(`Updating ${changedFiles.length} changed queries`);
    for (const { queryId, query_sql } of updates) {
      try {
        core.info(`Updating query with ID ${queryId}`);
        await queryManager.updateQuery(queryId, { query_sql });
      } catch (error) {
        core.setFailed(error.message);
      }
    }
    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true

    core.setOutput("output", "Unsure what this output should be");
  } catch (error) {
    core.error(error);
    // Fail the workflow run if an error occurs
    core.setFailed(error.message);
  }
}

module.exports = {
  run,
};
