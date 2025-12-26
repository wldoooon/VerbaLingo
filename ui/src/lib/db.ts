import Dexie, { Table } from "dexie";

// Define the Shape of our Data
export interface ChatSession {
  id: string; // The search term (e.g., "apple", "hello") - Primary Key
  branches: any[]; // Storing the array of conversation branches
  lastActive: number; // For sorting and TTL (Time To Live)
  createdAt: number;
  currentIndex?: number; // Persist the user's position in history
}

// Define the Database Class
export class MiniYouGlishDB extends Dexie {
  sessions!: Table<ChatSession>;

  constructor() {
    super("MiniYouGlishDB");

    // Define Schema
    // id: Primary Key (Search Term)
    // lastActive: Index for sorting by recency
    this.version(1).stores({
      sessions: "id, lastActive",
    });
  }
}

// Client-Side Singleton Initialization
// Only create the instance if we are in the browser.
// This prevents Next.js Server from crashing.
export const db =
  typeof window !== "undefined" ? new MiniYouGlishDB() : undefined;
