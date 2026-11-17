import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, useTransition } from "react";

import { LoginForm, type LoginMode, type LoginValues } from "@/components/login-form";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (await getSession()) throw redirect({ to: "/" });
  },
  component: Login,
});

function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit({ name, email, password }: LoginValues) {
    startTransition(async () => {
      setError(null);
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name });
      if (result.error) {
        setError(result.error.message ?? "Something went wrong");
        return;
      }
      await router.navigate({ to: "/" });
    });
  }

  return (
    <LoginForm
      mode={mode}
      error={error}
      pending={pending}
      onModeChange={setMode}
      onSubmit={submit}
    />
  );
}
