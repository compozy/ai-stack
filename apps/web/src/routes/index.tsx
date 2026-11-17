import { Button } from "@acme/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const user = await getSession();
    if (!user) throw redirect({ to: "/login" });
    return { user };
  },
  component: Home,
});

function Home() {
  const { user } = Route.useRouteContext();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    await router.navigate({ to: "/login" });
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Hello, {user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
