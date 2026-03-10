import Link from "next/link";
import { GitHubIcon } from "@/components/icons";
import { getIcon } from "@/lib/icons";
import { getConfig, getFooterLinks } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";

export function Footer({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const config = getConfig();
  const footerLinks = getFooterLinks(locale);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {footerLinks.length > 0 && (
          <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="text-lg font-bold text-foreground">
                {config.themeConfig.navbar.title}
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                {config.tagline}
              </p>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      {(() => {
                        const Icon = getIcon(item.icon);
                        return (
                          <Link
                            href={item.href}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          >
                            {Icon && <Icon className="h-3.5 w-3.5" />}
                            {item.label}
                          </Link>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {config.themeConfig.footer.copyright}. {dict.footer.rights}
          </p>

          <div className="flex items-center gap-4">
            {config.themeConfig.socials?.github && (
              <Link
                href={config.themeConfig.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <GitHubIcon className="h-5 w-5" />
              </Link>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {dict.footer.builtWith}
              <Link
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline-offset-2 hover:underline"
              >
                Next.js
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
