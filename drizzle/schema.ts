import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, float } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "analyst"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const knowledgeBases = mysqlTable("knowledge_bases", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  tags: json("tags"),
  ownerId: int("ownerId").notNull(),
  documentCount: int("documentCount").default(0).notNull(),
  status: mysqlEnum("status", ["active", "processing", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  knowledgeBaseId: int("knowledgeBaseId").notNull(),
  ownerId: int("ownerId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  documentType: varchar("documentType", { length: 32 }).notNull(),
  sourceUrl: text("sourceUrl"),
  storageKey: text("storageKey"),
  storageUrl: text("storageUrl"),
  status: mysqlEnum("status", ["queued", "processing", "ready", "failed"]).default("queued").notNull(),
  chunkCount: int("chunkCount").default(0).notNull(),
  extractedText: text("extractedText"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  knowledgeBaseId: int("knowledgeBaseId"),
  title: varchar("title", { length: 200 }).notNull(),
  messageCount: int("messageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  citations: json("citations"),
  confidence: float("confidence"),
  latencyMs: int("latencyMs"),
  tokenUsage: json("tokenUsage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  ownerId: int("ownerId").notNull(),
  rating: mysqlEnum("rating", ["up", "down"]).notNull(),
  hallucinationFlag: int("hallucinationFlag").default(0).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ingestionJobs = mysqlTable("ingestion_jobs", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  ownerId: int("ownerId").notNull(),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  progress: int("progress").default(0).notNull(),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const queryEvents = mysqlTable("query_events", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  query: text("query").notNull(),
  status: mysqlEnum("status", ["success", "error"]).default("success").notNull(),
  latencyMs: int("latencyMs"),
  retrievedCount: int("retrievedCount").default(0).notNull(),
  hitRate: float("hitRate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agentTraces = mysqlTable("agent_traces", {
  id: int("id").autoincrement().primaryKey(),
  queryEventId: int("queryEventId").notNull(),
  nodeName: varchar("nodeName", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["completed", "failed"]).default("completed").notNull(),
  durationMs: int("durationMs").default(0).notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const llmUsage = mysqlTable("llm_usage", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  model: varchar("model", { length: 120 }).notNull(),
  inputTokens: int("inputTokens").default(0).notNull(),
  outputTokens: int("outputTokens").default(0).notNull(),
  estimatedCost: float("estimatedCost").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type KnowledgeBase = typeof knowledgeBases.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
