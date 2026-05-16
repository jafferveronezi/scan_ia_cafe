import {
  boolean,
  float,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Diagnoses table — stores each AI diagnosis result for a leaf image.
 */
export const diagnoses = mysqlTable("diagnoses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  disease: varchar("disease", { length: 255 }).notNull(),
  diseaseSlug: varchar("diseaseSlug", { length: 64 }).notNull(),
  confidence: float("confidence").notNull(), // 0.0 - 1.0
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).notNull(),
  description: text("description"),
  recommendations: text("recommendations"), // JSON array stored as text
  isHealthy: boolean("isHealthy").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = typeof diagnoses.$inferInsert;
