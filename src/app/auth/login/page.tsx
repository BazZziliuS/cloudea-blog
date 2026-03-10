"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";
import { getDictionary, defaultLocale, type Locale, locales } from "@/lib/i18n";

export default function LoginPage() {
  const [t, setT] = useState(getDictionary(defaultLocale).auth);

  useEffect(() => {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1];
    const locale = raw && locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale;
    setT(getDictionary(locale).auth);
  }, []);

  const handleGitHubLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
          {t.title}
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {t.subtitle}
        </p>
        <Button onClick={handleGitHubLogin} className="w-full gap-3" size="lg">
          <GitHubIcon className="h-5 w-5" />
          {t.signInGithub}
        </Button>
      </div>
    </div>
  );
}
