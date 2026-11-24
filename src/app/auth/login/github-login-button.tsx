"use client";

import { useState } from "react";
import { GitHubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GitHubLoginButton({ label }: { label: string }) {
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    setPending(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    // On success the browser is redirected to GitHub; only reset on failure.
    if (error) setPending(false);
  };

  return (
    <Button onClick={signIn} disabled={pending} className="w-full gap-3" size="lg">
      <GitHubIcon className="h-5 w-5" />
      {label}
    </Button>
  );
}
