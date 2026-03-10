"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarCategory, SidebarSubcategory } from "@/lib/content";
import { cn } from "@/lib/utils";

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
            "block px-3 py-2 text-sm font-semibold transition-colors",
            pathname === "/docs"
              ? "text-primary"
              : "text-foreground hover:text-primary"
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

function formatName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4 transition-transform", open && "rotate-90")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
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

  useEffect(() => {
    if (isSubPath) setIsOpen(true);
  }, [isSubPath]);

  const indexHref = sub.indexSlug ? `/docs/${sub.indexSlug.join("/")}` : null;
  const isSubActive = indexHref ? pathname === indexHref : false;
  const displayName = sub.title ?? formatName(sub.name);

  return (
    <li>
      <div className="flex items-center justify-between px-3 py-1.5 text-sm font-medium">
        {indexHref ? (
          <Link
            href={indexHref}
            className={cn(
              "transition-colors",
              isSubActive ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            {displayName}
          </Link>
        ) : (
          <span className="text-foreground">{displayName}</span>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="hover:text-primary transition-colors">
          <ChevronIcon open={isOpen} />
        </button>
      </div>
      {isOpen && (
        <ul className="mt-1 space-y-1 pl-3">
          {sub.docs.map((doc) => (
            <DocLink key={doc.slug.join("/")} slug={doc.slug} title={doc.title} pathname={pathname} />
          ))}
        </ul>
      )}
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

  useEffect(() => {
    if (isCategoryPath) setIsOpen(true);
  }, [isCategoryPath]);

  const indexHref = category.indexSlug
    ? `/docs/${category.indexSlug.join("/")}`
    : null;
  const isCategoryActive = indexHref ? pathname === indexHref : false;

  return (
    <div>
      <div className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold">
        {indexHref ? (
          <Link
            href={indexHref}
            className={cn(
              "transition-colors",
              isCategoryActive ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            {formatName(category.name)}
          </Link>
        ) : (
          <span className="text-foreground">{formatName(category.name)}</span>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="hover:text-primary transition-colors">
          <ChevronIcon open={isOpen} />
        </button>
      </div>
      {isOpen && (
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
      )}
    </div>
  );
}
