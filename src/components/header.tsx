"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, Github, LogOut, ChevronDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConfig, getNavLinks, getDonateLink } from "@/lib/config";
import { SearchButton } from "@/components/search";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Dictionary, Locale } from "@/lib/i18n";

interface HeaderProps {
  dict: Dictionary;
  locale: Locale;
}

export function Header({ dict, locale }: HeaderProps) {
  const config = getConfig();
  const navItems = getNavLinks(locale);
  const donateLink = getDonateLink(locale);
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  const isSupabaseAuth = config.comments.provider === "supabase";

  useEffect(() => {
    setMounted(true);
    if (!isSupabaseAuth) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseAuth]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.user_name || user?.email;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            {config.themeConfig.navbar.title}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item, i) =>
              item.type === "dropdown" ? (
                <DropdownMenu
                  key={i}
                  open={openDropdown === i}
                  onOpenChange={(open) => setOpenDropdown(open ? i : null)}
                >
                  <DropdownMenuTrigger
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onMouseEnter={() => setOpenDropdown(i)}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.items.map((sub) => (
                      <DropdownMenuItem key={sub.href} asChild>
                        <Link
                          href={sub.href}
                          {...(sub.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {sub.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <SearchButton dict={dict.blog} />

          <LocaleSwitcher current={locale} />

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:inline-flex"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {config.themeConfig.socials?.github && (
            <Link
              href={config.themeConfig.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex"
            >
              <Button variant="ghost" size="icon" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {donateLink && (
            <Link
              href={donateLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <Heart className="h-4 w-4 fill-current" />
                {donateLink.label}
              </Button>
            </Link>
          )}

          {isSupabaseAuth && (user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={userName ?? "User"} />
                    <AvatarFallback>
                      {userName?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">{userName}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/auth/signout" method="POST" className="w-full">
                    <button type="submit" className="flex w-full items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      {dict.nav.signOut}
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className="hidden md:inline-flex">
              <Button variant="outline" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                {dict.nav.signIn}
              </Button>
            </Link>
          ))}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 sm:px-6">
            {navItems.map((item, i) =>
              item.type === "dropdown" ? (
                <div key={i} className="space-y-1">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {item.label}
                  </span>
                  {item.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block pl-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      {...(sub.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
                  onClick={() => setMobileMenuOpen(false)}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="flex items-center gap-2 pt-2">
              {mounted && (
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}

              {config.themeConfig.socials?.github && (
                <Link href={config.themeConfig.socials.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" aria-label="GitHub">
                    <Github className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            {donateLink && (
              <Link href={donateLink.href} target="_blank" rel="noopener noreferrer" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Heart className="h-4 w-4 fill-current" />
                  {donateLink.label}
                </Button>
              </Link>
            )}

            {isSupabaseAuth && !user && (
              <Link href="/auth/login" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Github className="h-4 w-4" />
                  {dict.nav.signIn}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
