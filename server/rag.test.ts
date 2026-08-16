import { describe, expect, it } from "vitest";
import { retrieve, runRagWorkflow, semanticChunk } from "./rag";

describe("semantic chunking", () => {
  it("keeps paragraph boundaries and creates overlapping context windows", () => {
    const chunks = semanticChunk("# Policy\n\nTenant isolation is enforced.\n\n# Controls\n\nAccess is reviewed quarterly.\n\n# Audit\n\nEvents are retained for seven years.", 80, 20, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(" ")).toContain("Tenant isolation");
    expect(chunks.join(" ")).toContain("Events are retained");
  });
});

describe("semantic retrieval", () => {
  it("ranks the most relevant evidence first and returns source metadata", () => {
    const results = retrieve("tenant isolation access policy", [
      { documentId: 1, filename: "security.pdf", text: "Tenant isolation and access policy controls are reviewed quarterly.", page: 12, section: "Security" },
      { documentId: 2, filename: "roadmap.pdf", text: "The product roadmap includes a redesigned navigation system.", page: 2, section: "Roadmap" },
    ]);
    expect(results[0]?.filename).toBe("security.pdf");
    expect(results[0]?.page).toBe(12);
    expect(results[0]?.relevance).toBeGreaterThan(results[1]?.relevance || 0);
  });
});

describe("RAG evidence safety", () => {
  it("returns the explicit insufficient-evidence response when no sources are available", async () => {
    const result = await runRagWorkflow("What is the retention policy?", []);
    expect(result.insufficientEvidence).toBe(true);
    expect(result.answer).toBe("Insufficient evidence found in the available knowledge base.");
    expect(result.citations).toHaveLength(0);
  });
});
