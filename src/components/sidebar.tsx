"use client";

import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(true);

  const formattedName =
    category.name.charAt(0).toUpperCase() +
    category.name.slice(1).replace(/-/g, " ");

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <span>{formattedName}</span>
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
