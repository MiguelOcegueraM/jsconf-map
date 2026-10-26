"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type ActionState } from "@/lib/actions";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  const [state, action, pending] = useActionState<ActionState, FormData>(login, undefined);

  return (
    <main className="grid min-h-dvh place-items-center bg-js-night px-5">
      <form
        action={action}
        className="w-full max-w-sm radius-panel border-4 border-js-indigo-900 bg-white p-6 shadow-[6px_6px_0_0_#ff2d95]"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-js-red-50">
          <Lock className="size-5 text-js-red-600" />
        </span>
        <h1 className="font-display mt-4 text-xl text-js-indigo-900">Back office</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Administración de la agenda de JSConf México 2026.
        </p>

        <input type="hidden" name="next" value={next} />

        <div className="mt-6 grid gap-2">
          <Label htmlFor="password">Contraseña maestra</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="h-11"
          />
        </div>

        {state?.error && (
          <p role="alert" className="mt-3 text-sm font-medium text-js-red-600">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-5 h-11 w-full">
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </main>
  );
}
