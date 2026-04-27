import { describe, it, expect, vi } from "vitest";

vi.mock("../src/main", () => ({
  run: vi.fn(),
}));

import { run } from "../src/main";

describe("index", () => {
  it("calls run when imported", async () => {
    await import("../src/index");
    expect(run).toHaveBeenCalled();
  });
});
