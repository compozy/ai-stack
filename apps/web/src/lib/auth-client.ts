import { createAuthClient } from "better-auth/react";

/** Talks to the handler at `/api/auth/*` on the same origin. */
export const authClient = createAuthClient();
