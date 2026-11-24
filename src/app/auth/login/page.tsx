import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupabaseAuthEnabled, seo } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { GitHubLoginButton } from "./github-login-button";

export async function generateMetadata(): Promise<Metadata> {
  const { auth } = getDictionary(await getLocale());
  return seo({ title: auth.title, path: "/auth/login", noIndex: true });
}

export default async function LoginPage() {
  if (!isSupabaseAuthEnabled()) notFound();

  const t = getDictionary(await getLocale()).auth;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">{t.subtitle}</p>
        <GitHubLoginButton label={t.signInGithub} />
      </div>
    </div>
  );
}
