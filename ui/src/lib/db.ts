import Dexie, { Table } from "dexie";

// Define the Shape of our Data
export interface ChatSession {
  id: string;
  branches: any[];
  lastActive: number;
  createdAt: number;
  currentIndex?: number;
}

// Define the Database Class
export class PokiSpokeyDB extends Dexie {
  sessions!: Table<ChatSession>;

  constructor(dbName: string = "PokiSpokeyDB") {
    super(dbName);
    this.version(1).stores({
      sessions: "id, lastActive",
    });
  }
}

// Default instance (fallback for unauthenticated or legacy usage)
export const db: PokiSpokeyDB | undefined =
  typeof window !== "undefined"
    ? (() => { try { return new PokiSpokeyDB(); } catch { return undefined; } })()
    : undefined;

// User-scoped DB cache — one IndexedDB per user
const userDBCache = new Map<string, PokiSpokeyDB>();

export function getUserDB(userId: string): PokiSpokeyDB | undefined {
  if (typeof window === "undefined") return undefined;
  if (userDBCache.has(userId)) return userDBCache.get(userId)!;
  try {
    const instance = new PokiSpokeyDB(`PokiSpokeyDB_${userId}`);
    userDBCache.set(userId, instance);
    return instance;
  } catch {
    return undefined;
  }
}
