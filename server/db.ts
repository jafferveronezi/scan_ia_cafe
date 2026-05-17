import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { diagnoses, InsertDiagnosis, InsertUser, users } from "../drizzle/schema.sqlite";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const databaseUrl = process.env.DATABASE_URL.replace(/^file:\/*/, "");
      const sqlite = new Database(databaseUrl);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  await db
    .insert(users)
    .values(user)
    .onDuplicateKeyUpdate({
      set: {
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        lastSignedIn: new Date(),
        updatedAt: new Date(),
      },
    });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

// ─── Diagnoses ────────────────────────────────────────────────────────────────

export async function createDiagnosis(data: InsertDiagnosis): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(diagnoses).values(data);
  return (result as any)[0]?.insertId ?? 0;
}

export async function getDiagnosesByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(diagnoses)
    .where(eq(diagnoses.userId, userId))
    .orderBy(desc(diagnoses.createdAt))
    .limit(limit);
}

export async function getDiagnosisById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(diagnoses)
    .where(eq(diagnoses.id, id))
    .limit(1);

  const diagnosis = result[0];
  if (!diagnosis || diagnosis.userId !== userId) return null;
  return diagnosis;
}

export async function getUserDiagnosisStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, healthy: 0, diseased: 0 };

  const all = await db
    .select()
    .from(diagnoses)
    .where(eq(diagnoses.userId, userId));

  const total = all.length;
  const healthy = all.filter((d) => d.isHealthy).length;
  const diseased = total - healthy;

  return { total, healthy, diseased };
}
