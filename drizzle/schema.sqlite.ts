import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).defaultNow().notNull(),
});

export const diagnoses = sqliteTable("diagnoses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey"),
  disease: text("disease").notNull(),
  diseaseSlug: text("diseaseSlug").notNull(),
  confidence: real("confidence").notNull(),
  riskLevel: text("riskLevel", { enum: ["low", "medium", "high"] }).notNull(),
  description: text("description"),
  recommendations: text("recommendations"),
  isHealthy: integer("isHealthy", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});
