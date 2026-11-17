import { createFileRoute } from "@tanstack/react-router";

import { getAuth } from "@/lib/auth";

/** Every `/api/auth/*` request (sign-in, sign-up, session, sign-out) goes to Better Auth. */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => getAuth().handler(request),
      POST: ({ request }) => getAuth().handler(request),
    },
  },
});
