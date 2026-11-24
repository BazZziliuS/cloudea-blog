"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, Heart, LogOut, Menu, X } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SearchButton } from "@/components/search";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ResolvedNavItem } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";
import { createClient } from "@/lib/supabase/client";

export interface HeaderProps {
  title: string;
  navItems: ResolvedNavItem[];
  donateLink: { href: string; label: string } | null;
  githubUrl?: string;
  authEnabled: boolean;
  dict: Dictionary;
  locale: Locale;
}

const externalLinkProps = { target: "_blank", rel: "noopener noreferrer" } as const;

function useSupabaseUser(enabled: boolean): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, [enabled]);

  return user;
}

export function Header({ title, navItems, donateLink, githubUrl, authEnabled, dict, locale }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSupabaseUser(authEnabled);
  const pathname = usePathname();

  // Close the mobile menu after navigation.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
  const userName: string | undefined = user?.user_metadata?.user_name || user?.email;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) =>
              item.type === "dropdown" ? (
                <div key={item.label} className="group/nav relative">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover/nav:rotate-180" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover/nav:rotate-180" />
                    </button>
                  )}
                  <div className="invisible absolute left-0 top-full translate-y-1 pt-2 opacity-0 transition-all duration-200 ease-out group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                    <div className="min-w-[10rem] rounded-md border border-border bg-popover p-1 shadow-md">
                      {item.items.map((sub) => {
                        const Icon = getIcon(sub.icon);
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            {...(sub.external ? externalLinkProps : {})}
                          >
                            {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  {...(item.external ? externalLinkProps : {})}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <SearchButton dict={dict.blog} />
          <LocaleSwitcher current={locale} label={dict.common.language} />
          <ThemeToggle label={dict.common.toggleTheme} className="hidden md:inline-flex" />

          {githubUrl && (
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
              <a href={githubUrl} aria-label="GitHub" {...externalLinkProps}>
                <GitHubIcon className="h-5 w-5" />
              </a>
            </Button>
          )}

          {donateLink && (
            <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex" asChild>
              <a href={donateLink.href} {...externalLinkProps}>
                <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                {donateLink.label}
              </a>
            </Button>
          )}

          {authEnabled &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label={userName ?? "User"}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} alt={userName ?? "User"} />
                      <AvatarFallback>{userName?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">{userName}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action="/auth/signout" method="POST" className="w-full">
                      <button type="submit" className="flex w-full items-center gap-2">
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {dict.nav.signOut}
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" className="hidden gap-2 md:inline-flex" asChild>
                <Link href="/auth/login">
                  <GitHubIcon className="h-4 w-4" />
                  {dict.nav.signIn}
                </Link>
              </Button>
            ))}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={dict.common.toggleMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="border-t border-border md:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-6 py-4">
            {navItems.map((item) =>
              item.type === "dropdown" ? (
                <div key={item.label} className="space-y-1">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {item.label}
                  </span>
                  {item.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block pl-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      {...(sub.external ? externalLinkProps : {})}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  {...(item.external ? externalLinkProps : {})}
                >
                  {item.label}
                </Link>
              ),
            )}

            <div className="flex items-center gap-2 pt-2">
              <ThemeToggle label={dict.common.toggleTheme} />
              {githubUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={githubUrl} aria-label="GitHub" {...externalLinkProps}>
                    <GitHubIcon className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>

            {donateLink && (
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <a href={donateLink.href} {...externalLinkProps}>
                  <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                  {donateLink.label}
                </a>
              </Button>
            )}

            {authEnabled && !user && (
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <Link href="/auth/login">
                  <GitHubIcon className="h-4 w-4" />
                  {dict.nav.signIn}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
