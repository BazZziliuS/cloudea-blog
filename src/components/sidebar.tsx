"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarCategory, SidebarSubcategory } from "@/lib/content";
import { cn, humanizeSlug } from "@/lib/utils";

interface SidebarProps {
  categories: SidebarCategory[];
  indexTitle?: string;
}

export function Sidebar({ categories, indexTitle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-4 py-4">
      {indexTitle && (
        <Link
          href="/docs"
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-semibold transition-colors",
            pathname === "/docs"
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted/50 hover:text-primary"
          )}
        >
          {indexTitle}
        </Link>
      )}
      {categories.map((category) => (
        <SidebarSection
          key={category.name}
          category={category}
          pathname={pathname}
        />
      ))}
    </nav>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-90")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CollapsibleContent({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setHeight(open ? undefined : 0);
      return;
    }
    if (open) {
      const h = ref.current?.scrollHeight ?? 0;
      setHeight(h);
      const timer = setTimeout(() => setHeight(undefined), 200);
      return () => clearTimeout(timer);
    } else {
      const h = ref.current?.scrollHeight ?? 0;
      setHeight(h);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div
      ref={ref}
      className="overflow-hidden transition-[height] duration-200 ease-out"
      style={{ height: height !== undefined ? `${height}px` : "auto" }}
    >
      {children}
    </div>
  );
}

function DocLink({ slug, title, pathname }: { slug: string[]; title: string; pathname: string }) {
  const href = `/docs/${slug.join("/")}`;
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "block rounded-md px-3 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {title}
      </Link>
    </li>
  );
}

function SidebarSubcategorySection({
  sub,
  parentName,
  pathname,
}: {
  sub: SidebarSubcategory;
  parentName: string;
  pathname: string;
}) {
  const isSubPath = pathname.startsWith(`/docs/${parentName}/${sub.name}`);
  const [isOpen, setIsOpen] = useState(isSubPath);

  // Auto-expand when navigating into this section (state adjusted during render, not in an effect).
  const [wasActive, setWasActive] = useState(isSubPath);
  if (isSubPath !== wasActive) {
    setWasActive(isSubPath);
    if (isSubPath) setIsOpen(true);
  }

  const indexHref = sub.indexSlug ? `/docs/${sub.indexSlug.join("/")}` : null;
  const displayName = sub.title ?? humanizeSlug(sub.name);

  return (
    <li>
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          isOpen
            ? "bg-muted/60 text-primary"
            : "text-foreground hover:bg-muted/50 hover:text-primary"
        )}
      >
        {indexHref ? (
          <Link href={indexHref} className="flex-1 transition-colors hover:text-primary">
            {displayName}
          </Link>
        ) : (
          <button type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} className="flex-1 text-left">
            {displayName}
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={displayName}
          className="rounded-md p-0.5 transition-colors hover:text-primary"
        >
          <ChevronIcon open={isOpen} />
        </button>
      </div>
      <CollapsibleContent open={isOpen}>
        <ul className="mt-1 space-y-1 pl-3">
          {sub.docs.map((doc) => (
            <DocLink key={doc.slug.join("/")} slug={doc.slug} title={doc.title} pathname={pathname} />
          ))}
        </ul>
      </CollapsibleContent>
    </li>
  );
}

function SidebarSection({
  category,
  pathname,
}: {
  category: SidebarCategory;
  pathname: string;
}) {
  const isCategoryPath = pathname.startsWith(`/docs/${category.name}`);
  const [isOpen, setIsOpen] = useState(isCategoryPath);

  // Auto-expand when navigating into this section (state adjusted during render, not in an effect).
  const [wasActive, setWasActive] = useState(isCategoryPath);
  if (isCategoryPath !== wasActive) {
    setWasActive(isCategoryPath);
    if (isCategoryPath) setIsOpen(true);
  }

  const indexHref = category.indexSlug
    ? `/docs/${category.indexSlug.join("/")}`
    : null;
  const displayName = category.title ?? humanizeSlug(category.name);

  return (
    <div>
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-colors",
          isOpen
            ? "bg-muted text-primary"
            : "text-foreground hover:bg-muted/50 hover:text-primary"
        )}
      >
        {indexHref ? (
          <Link href={indexHref} className="flex-1 transition-colors hover:text-primary">
            {displayName}
          </Link>
        ) : (
          <button type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} className="flex-1 text-left">
            {displayName}
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={displayName}
          className="rounded-md p-0.5 transition-colors hover:text-primary"
        >
          <ChevronIcon open={isOpen} />
        </button>
      </div>
      <CollapsibleContent open={isOpen}>
        <ul className="mt-1 space-y-1 pl-3">
          {category.docs.map((doc) => (
            <DocLink key={doc.slug.join("/")} slug={doc.slug} title={doc.title} pathname={pathname} />
          ))}
          {category.subcategories.map((sub) => (
            <SidebarSubcategorySection
              key={sub.name}
              sub={sub}
              parentName={category.name}
              pathname={pathname}
            />
          ))}
        </ul>
      </CollapsibleContent>
    </div>
  );
}
