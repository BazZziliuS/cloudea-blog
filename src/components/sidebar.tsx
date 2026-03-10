"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarCategory } from "@/lib/content";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: SidebarCategory[];
}

export function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-4 py-4">
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

  const formattedName =
    category.name.charAt(0).toUpperCase() +
    category.name.slice(1).replace(/-/g, " ");

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
            {formattedName}
          </Link>
        ) : (
          <span className="text-foreground">{formattedName}</span>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="hover:text-primary transition-colors">
        <svg
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-90"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
        </button>
      </div>
      {isOpen && (
        <ul className="mt-1 space-y-1 pl-3">
          {category.docs.map((doc) => {
            const href = `/docs/${doc.slug.join("/")}`;
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {doc.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
