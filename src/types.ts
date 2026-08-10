export type UpdateResult =
  | { status: "updated"; queryId: number; file: string }
  | { status: "skipped"; file: string; reason: string }
  | { status: "failed"; queryId?: number; file: string; error: string };

export interface QueryConfig {
  queryId: number;
  file: string;
  name?: string;
  description?: string;
}

export interface DuneTomlConfig {
  queryId: number;
  name?: string;
  description?: string;
}

export interface UpdateOptions {
  apiKey: string;
  files: string[];
  dryRun?: boolean;
  apiBaseUrl?: string;
}
