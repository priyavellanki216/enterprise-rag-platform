import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "admin" | "analyst"): TrpcContext {
  return {
    user: { id: 42, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("RAG router access controls", () => {
  it("returns a public healthy service response", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
    const result = await caller.health();
    expect(result.status).toBe("healthy");
    expect(result.services.storage).toBe(true);
  });

  it("rejects analyst access to admin user management", async () => {
    const caller = appRouter.createCaller(context("analyst"));
    await expect(caller.rag.adminUsers()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
