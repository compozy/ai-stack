import type { Database } from "@acme/db";
import * as schema from "@acme/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { ApiEnv } from "./env";

export function createAuth(db: Database, env: ApiEnv) {
  return betterAuth({
    baseURL: env.API_URL,
    basePath: "/auth",
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.APP_URL],
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: { enabled: true },
  });
}

export type Auth = ReturnType<typeof createAuth>;
