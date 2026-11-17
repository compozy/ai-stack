import { createDb, type Database } from "@acme/db";

let database: Database | undefined;

/** Lazy singleton: `vite build` and `tsc` work without DATABASE_URL, and serverless gets one connection. */
export function getDb(): Database {
  if (!database) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    database = createDb(url, { max: 1 });
  }
  return database;
}
