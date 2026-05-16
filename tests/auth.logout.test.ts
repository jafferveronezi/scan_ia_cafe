import { describe, expect, it } from "vitest";

describe("auth", () => {
  it("health check returns ok", async () => {
    // Basic sanity test - the router should be importable
    const { appRouter } = await import("../server/routers");
    expect(appRouter).toBeDefined();
  });

  it("diagnoses router exists", async () => {
    const { appRouter } = await import("../server/routers");
    expect(appRouter._def.procedures).toBeDefined();
  });
});
