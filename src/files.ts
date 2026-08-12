import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { parse as parseToml } from "smol-toml";
import type { QueryConfig, DuneTomlConfig } from "./types";

export function extractQueryId(name: string): number | null {
  const match = name.match(/_(\d+)\.sql$/);
  return match ? parseInt(match[1], 10) : null;
}

export function readQueryFile(path: string): string {
  try {
    return readFileSync(path, { encoding: "utf8" });
  } catch {
    return "";
  }
}

export function readDuneToml(sqlFilePath: string): DuneTomlConfig | null {
  const dir = dirname(sqlFilePath);
  const tomlPath = join(dir, "dune.toml");
  if (!existsSync(tomlPath)) return null;

  try {
    const content = readFileSync(tomlPath, { encoding: "utf8" });
    const parsed = parseToml(content) as {
      query?: { id?: number; name?: string; description?: string };
    };
    if (!parsed.query || typeof parsed.query.id !== "number") return null;
    return {
      queryId: parsed.query.id,
      name: parsed.query.name,
      description: parsed.query.description,
    };
  } catch {
    return null;
  }
}

export function resolveQueryConfig(filePath: string): QueryConfig | null {
  const tomlConfig = readDuneToml(filePath);
  if (tomlConfig) {
    return { ...tomlConfig, file: filePath };
  }

  const queryId = extractQueryId(filePath);
  if (queryId === null) return null;
  return { queryId, file: filePath };
}

export function detectChangedFiles(queryPath: string, base?: string): string[] {
  const diffBase = base || detectDiffBase();

  try {
    const result = execFileSync(
      "git",
      [
        "diff",
        "--name-only",
        "--diff-filter=ACMRT",
        diffBase,
        "HEAD",
        "--",
        queryPath,
      ],
      { encoding: "utf8" },
    );
    return result
      .trim()
      .split("\n")
      .filter(f => f.endsWith(".sql") && f !== "");
  } catch {
    return [];
  }
}

function detectDiffBase(): string {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (baseRef) return `origin/${baseRef}`;

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath) {
    try {
      const event = JSON.parse(readFileSync(eventPath, { encoding: "utf8" }));
      if (
        event.before &&
        event.before !== "0000000000000000000000000000000000000000"
      ) {
        return event.before;
      }
    } catch {
      /* fall through */
    }
  }

  return "HEAD~1";
}
