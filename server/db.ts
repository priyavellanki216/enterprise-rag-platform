import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import { agentTraces, conversations, documents, feedback, ingestionJobs, knowledgeBases, llmUsage, messages, queryEvents, users, type InsertUser } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"), lastSignedIn: new Date() };
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: { name: values.name, email: values.email, loginMethod: values.loginMethod, role: values.role, lastSignedIn: values.lastSignedIn } });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getOverview(ownerId: number) {
  const db = await getDb();
  if (!db) return null;
  const [bases, docs, events, jobs, traces] = await Promise.all([
    db.select().from(knowledgeBases).where(eq(knowledgeBases.ownerId, ownerId)).orderBy(desc(knowledgeBases.updatedAt)),
    db.select().from(documents).where(eq(documents.ownerId, ownerId)).orderBy(desc(documents.createdAt)).limit(20),
    db.select().from(queryEvents).where(eq(queryEvents.ownerId, ownerId)).orderBy(desc(queryEvents.createdAt)).limit(50),
    db.select().from(ingestionJobs).where(eq(ingestionJobs.ownerId, ownerId)).orderBy(desc(ingestionJobs.createdAt)).limit(10),
    db.select().from(agentTraces).orderBy(desc(agentTraces.createdAt)).limit(12),
  ]);
  const totalQueries = events.length;
  const avgLatency = totalQueries ? Math.round(events.reduce((sum, event) => sum + (event.latencyMs || 0), 0) / totalQueries) : 0;
  const hitRate = totalQueries ? Number((events.reduce((sum, event) => sum + (event.hitRate || 0), 0) / totalQueries).toFixed(2)) : 0;
  return { bases, docs, events, jobs, traces, metrics: { totalQueries, avgLatency, hitRate, errorRate: totalQueries ? Number((events.filter(event => event.status === "error").length / totalQueries).toFixed(2)) : 0 } };
}

export async function createKnowledgeBase(ownerId: number, name: string, description?: string, tags?: string[]) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(knowledgeBases).values({ ownerId, name, description, tags: tags || [] });
  return Number(result[0].insertId);
}

export async function createDocument(input: { ownerId: number; knowledgeBaseId: number; filename: string; documentType: string; sourceUrl?: string; storageKey?: string; storageUrl?: string; extractedText?: string; metadata?: Record<string, unknown>; chunkCount?: number; status?: "queued" | "processing" | "ready" | "failed" }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(documents).values(input);
  await db.update(knowledgeBases).set({ documentCount: sql`${knowledgeBases.documentCount} + 1`, updatedAt: new Date() }).where(and(eq(knowledgeBases.id, input.knowledgeBaseId), eq(knowledgeBases.ownerId, input.ownerId)));
  return Number(result[0].insertId);
}

export async function saveIngestionJob(documentId: number, ownerId: number, status: "queued" | "processing" | "completed" | "failed", progress: number, errorMessage?: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(ingestionJobs).values({ documentId, ownerId, status, progress, errorMessage, completedAt: status === "completed" || status === "failed" ? new Date() : undefined });
  return Number(result[0].insertId);
}

export async function saveConversation(ownerId: number, title: string, knowledgeBaseId?: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(conversations).values({ ownerId, title, knowledgeBaseId });
  return Number(result[0].insertId);
}

export async function saveMessage(input: { conversationId: number; role: "user" | "assistant"; content: string; citations?: unknown; confidence?: number; latencyMs?: number; tokenUsage?: unknown }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(messages).values(input);
  await db.update(conversations).set({ messageCount: sql`${conversations.messageCount} + 1`, updatedAt: new Date() }).where(eq(conversations.id, input.conversationId));
  return Number(result[0].insertId);
}

export async function saveFeedback(input: { messageId: number; ownerId: number; rating: "up" | "down"; hallucinationFlag?: boolean; comment?: string }) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(feedback).values({ ...input, hallucinationFlag: input.hallucinationFlag ? 1 : 0 });
  return true;
}

export async function saveQueryEvent(input: { ownerId: number; query: string; status: "success" | "error"; latencyMs: number; retrievedCount: number; hitRate: number }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(queryEvents).values(input);
  return Number(result[0].insertId);
}

export async function saveTrace(input: { queryEventId: number; nodeName: string; status: "completed" | "failed"; durationMs: number; detail: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(agentTraces).values(input);
}

export async function saveUsage(input: { ownerId: number; model: string; inputTokens: number; outputTokens: number; estimatedCost: number }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(llmUsage).values(input);
}

export async function getConversations(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).where(eq(conversations.ownerId, ownerId)).orderBy(desc(conversations.updatedAt));
}

export async function getConversation(ownerId: number, id: number) {
  const db = await getDb();
  if (!db) return null;
  const conversation = (await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.ownerId, ownerId))).limit(1))[0];
  if (!conversation) return null;
  const conversationMessages = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  return { conversation, messages: conversationMessages };
}

export async function getDocuments(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.ownerId, ownerId)).orderBy(desc(documents.createdAt));
}

export async function updateKnowledgeBase(ownerId: number, id: number, input: { name?: string; description?: string; tags?: string[] }) {
  const db = await getDb();
  if (!db) return false;
  await db.update(knowledgeBases).set({ ...input, updatedAt: new Date() }).where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.ownerId, ownerId)));
  return true;
}

export async function deleteKnowledgeBase(ownerId: number, id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(knowledgeBases).where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.ownerId, ownerId)));
  return true;
}
