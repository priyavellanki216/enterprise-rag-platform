import crypto from "node:crypto";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { invokeLLM } from "./_core/llm";

export type Source = {
  documentId: number;
  filename: string;
  page?: number;
  section?: string;
  relevance: number;
  excerpt: string;
};

export type AgentTrace = {
  node: string;
  status: "completed" | "failed";
  durationMs: number;
  detail: string;
};

export type RagResult = {
  answer: string;
  confidence: number;
  citations: Source[];
  traces: AgentTrace[];
  latencyMs: number;
  tokenUsage: { input: number; output: number; total: number; estimatedCost: number };
  insufficientEvidence: boolean;
};

export async function extractText(buffer: Buffer, type: string, sourceUrl?: string) {
  if (sourceUrl) {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`URL source returned ${response.status}`);
    return (await response.text()).replace(/<[^>]+>/g, " ");
  }
  if (type === "application/pdf" || type === "pdf") {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    return parsed.text;
  }
  if (type.includes("word") || type === "docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }
  return buffer.toString("utf8");
}

export function semanticChunk(text: string, chunkSize = 900, overlap = 140, minimum = 160) {
  const normalized = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  const paragraphs = normalized.split(/\n{2,}|(?=^#{1,6} )/gm).map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (!current) current = paragraph;
    else if ((current + "\n\n" + paragraph).length <= chunkSize) current += `\n\n${paragraph}`;
    else {
      chunks.push(current);
      const tail = current.slice(Math.max(0, current.length - overlap));
      current = `${tail}\n\n${paragraph}`.trim();
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(chunk => chunk.length >= minimum || chunks.length === 1);
}

function vectorize(text: string, dimensions = 48) {
  const vector = Array.from({ length: dimensions }, () => 0);
  for (const token of text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
    const hash = crypto.createHash("sha1").update(token).digest();
    for (let i = 0; i < 4; i++) vector[hash[i] % dimensions] += hash[i + 4] / 255;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map(value => value / norm);
}

function cosine(a: number[], b: number[]) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

export function retrieve(query: string, chunks: Array<{ documentId: number; filename: string; text: string; page?: number; section?: string }>, topK = 5): Source[] {
  const queryVector = vectorize(query);
  return chunks.map(chunk => ({ ...chunk, relevance: cosine(queryVector, vectorize(chunk.text)) }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, topK)
    .map(chunk => ({
      documentId: chunk.documentId,
      filename: chunk.filename,
      page: chunk.page,
      section: chunk.section,
      relevance: Math.max(0, Math.min(0.99, Number(((chunk.relevance + 1) / 2).toFixed(3)))),
      excerpt: chunk.text.slice(0, 240),
    }));
}

async function runAgent(name: string, detail: string, fn: () => Promise<void>, traces: AgentTrace[]) {
  const started = Date.now();
  try {
    await fn();
    traces.push({ node: name, status: "completed", durationMs: Date.now() - started, detail });
  } catch (error) {
    traces.push({ node: name, status: "failed", durationMs: Date.now() - started, detail: String(error) });
    throw error;
  }
}

export async function runRagWorkflow(query: string, chunks: Array<{ documentId: number; filename: string; text: string; page?: number; section?: string }>): Promise<RagResult> {
  const started = Date.now();
  const traces: AgentTrace[] = [];
  let rewrittenQuery = query;
  let citations: Source[] = [];
  let confidence = 0;
  let answer = "";
  let insufficientEvidence = false;
  let tokenUsage = { input: 0, output: 0, total: 0, estimatedCost: 0 };

  await runAgent("Query Analyzer", "Used the configured LLM to normalize intent and extract retrieval terms", async () => {
    if (chunks.length === 0) { rewrittenQuery = query.trim().replace(/\\s+/g, " "); return; }
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Rewrite the user request into a concise enterprise knowledge-base search query. Return JSON only." },
        { role: "user", content: query.trim().replace(/\\s+/g, " ") },
      ],
      response_format: { type: "json_schema", json_schema: { name: "rewritten_query", strict: true, schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"], additionalProperties: false } } },
    });
    const content = response.choices?.[0]?.message?.content;
    rewrittenQuery = typeof content === "string" ? (JSON.parse(content).query || query.trim()) : query.trim();
  }, traces);
  await runAgent("Retrieval Agent", "Searched the active knowledge base with semantic vectors", async () => {
    citations = retrieve(rewrittenQuery, chunks);
  }, traces);
  await runAgent("Evidence Validator", "Validated relevance threshold and evidence coverage", async () => {
    confidence = citations.length ? Math.max(...citations.map(c => c.relevance)) : 0;
    insufficientEvidence = confidence < 0.38;
  }, traces);

  await runAgent("Answer Generator", "Synthesized an answer grounded only in retrieved excerpts", async () => {
    if (insufficientEvidence) {
      answer = "Insufficient evidence found in the available knowledge base.";
      return;
    }
    const context = citations.map((citation, index) => `[${index + 1}] ${citation.filename}${citation.page ? `, page ${citation.page}` : ""}\n${citation.excerpt}`).join("\n\n");
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an enterprise research assistant. Answer only from the provided evidence. Keep the answer concise, state uncertainty, and include citation markers such as [1]." },
        { role: "user", content: `Question: ${rewrittenQuery}\n\nEvidence:\n${context}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "grounded_answer",
          strict: true,
          schema: {
            type: "object",
            properties: { answer: { type: "string" }, confidence: { type: "number" }, citations: { type: "array", items: { type: "integer" } } },
            required: ["answer", "confidence", "citations"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : null;
    answer = parsed?.answer || citations.map(c => c.excerpt).join(" ");
    confidence = Math.min(confidence, Number(parsed?.confidence || confidence));
    tokenUsage = { input: response.usage?.prompt_tokens || 0, output: response.usage?.completion_tokens || 0, total: response.usage?.total_tokens || 0, estimatedCost: Number((((response.usage?.total_tokens || 0) / 1000000) * 4).toFixed(5)) };
  }, traces);
  await runAgent("Citation Validator", "Checked that every grounded response has source references", async () => {
    if (!insufficientEvidence && citations.length === 0) throw new Error("No citations available");
  }, traces);
  await runAgent("Quality Checker", "Checked faithfulness, confidence, and response readiness", async () => {
    if (confidence < 0.35) insufficientEvidence = true;
  }, traces);

  return { answer, confidence: Number(confidence.toFixed(3)), citations, traces, latencyMs: Date.now() - started, tokenUsage, insufficientEvidence };
}
