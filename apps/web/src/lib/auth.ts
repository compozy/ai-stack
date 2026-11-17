import { schema } from "@acme/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getDb } from "./db";

function createAuth() {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    emailAndPassword: { enabled: true },
    // Must remain the last plugin so TanStack Start cookie handling wraps the others.
    plugins: [tanstackStartCookies()],
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

/** Built on first use so the build works without env and no connection opens until a request. */
export function getAuth() {
  return (auth ??= createAuth());
}
