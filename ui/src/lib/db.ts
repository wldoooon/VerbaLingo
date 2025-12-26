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
export class MiniYouGlishDB extends Dexie {
  sessions!: Table<ChatSession>;

  constructor() {
    super("MiniYouGlishDB");
    this.version(1).stores({
      sessions: "id, lastActive",
    });
  }
}

export const db =
  typeof window !== "undefined" ? new MiniYouGlishDB() : undefined;
