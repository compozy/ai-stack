import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { getAuth } from "./auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

const readSessionUser = createServerOnlyFn(async (): Promise<SessionUser | null> => {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
});

/** Session read for route guards. Guards are navigation UX, not the data-access boundary. */
export const getSession = createServerFn({ method: "GET" }).handler(() => readSessionUser());

/** Call at the top of every data server function: it fails closed without a session. */
export const requireUser = createServerOnlyFn(async (): Promise<SessionUser> => {
  const user = await readSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
});
