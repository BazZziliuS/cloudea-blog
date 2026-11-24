"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TocSection {
  heading: TocHeading;
  children: TocHeading[];
}

/** Heading text without the "#" anchor appended by rehype-autolink-headings. */
function headingText(heading: Element): string {
  const copy = heading.cloneNode(true) as Element;
  copy.querySelectorAll(".heading-anchor").forEach((anchor) => anchor.remove());
  return copy.textContent?.trim() ?? "";
}

interface TableOfContentsProps {
  label: string;
  labels: { expand: string; collapse: string };
  /** `sidebar`: sticky column with a heading; `collapsible`: a closed-by-default block for small screens. */
  variant?: "sidebar" | "collapsible";
}

export function TableOfContents({ label, labels, variant = "sidebar" }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const manuallyToggled = useRef<Set<string>>(new Set());
  const pathname = usePathname();

  const collectHeadings = useCallback(() => {
    const article = document.querySelector(".prose");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3, h4");
    const items: TocHeading[] = [];

    elements.forEach((el) => {
      if (el.id) {
        items.push({
          id: el.id,
          text: headingText(el),
          level: Number(el.tagName[1]),
        });
      }
    });

    setHeadings(items);
    setActiveId("");
    setExpanded(new Set());
    manuallyToggled.current = new Set();
  }, []);

  // Group headings into sections: h2 with nested h3/h4
  const sections = useMemo<TocSection[]>(() => {
    const result: TocSection[] = [];
    for (const h of headings) {
      if (h.level === 2) {
        result.push({ heading: h, children: [] });
      } else if (result.length > 0) {
        result[result.length - 1].children.push(h);
      }
    }
    return result;
  }, [headings]);

  // Re-collect headings on pathname change and on DOM mutations inside .prose
  useEffect(() => {
    // Headings live in server-rendered MDX, so they can only be read from the DOM after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    collectHeadings();

    const article = document.querySelector(".prose");
    if (!article) return;

    const observer = new MutationObserver(() => {
      collectHeadings();
    });
    observer.observe(article, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [collectHeadings, pathname]);

  // Auto-expand active section, auto-collapse others (unless manually toggled)
  useEffect(() => {
    if (!activeId) return;

    let activeSectionId: string | null = null;
    for (const section of sections) {
      if (
        section.heading.id === activeId ||
        section.children.some((c) => c.id === activeId)
      ) {
        activeSectionId = section.heading.id;
        break;
      }
    }

    if (!activeSectionId) return;

    setExpanded((prev) => {
      const next = new Set<string>();

      // Always expand the active section
      next.add(activeSectionId);

      // Keep manually toggled sections in their current state
      for (const section of sections) {
        const id = section.heading.id;
        if (id === activeSectionId) continue;
        if (manuallyToggled.current.has(id) && prev.has(id)) {
          next.add(id);
        }
      }

      return next;
    });
  }, [activeId, sections]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px", threshold: 0.1 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
    }
  };

  const toggleSection = (id: string) => {
    manuallyToggled.current.add(id);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // If manually collapsed, remove from manual tracking so auto-collapse works next time
        manuallyToggled.current.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const nav = (
    <nav
      className={variant === "sidebar" ? "sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto" : "mt-3"}
      aria-label={label}
    >
      {variant === "sidebar" && <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>}
      <ul className="space-y-0.5 border-l border-border">
        {sections.map((section) => {
          const isExpanded = expanded.has(section.heading.id);
          const hasChildren = section.children.length > 0;
          const isActive = activeId === section.heading.id;
          const hasActiveChild = section.children.some(
            (c) => c.id === activeId
          );

          return (
            <li key={section.heading.id}>
              <div className="flex items-center -ml-px">
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.heading.id)}
                    className="shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={isExpanded ? labels.collapse : labels.expand}
                    aria-expanded={isExpanded}
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                )}
                <a
                  href={`#${section.heading.id}`}
                  className={cn(
                    "block border-l py-1 pl-3 text-sm transition-colors",
                    !hasChildren && "ml-[18px]",
                    isActive || hasActiveChild
                      ? "border-primary font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(section.heading.id);
                  }}
                >
                  {section.heading.text}
                </a>
              </div>

              {hasChildren && (
                <ul
                  className={cn(
                    "ml-8 overflow-hidden transition-opacity duration-200",
                    isExpanded
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  {section.children.map((child) => (
                    <li key={child.id}>
                      <a
                        href={`#${child.id}`}
                        style={{
                          paddingLeft: `${(child.level - 2) * 12}px`,
                        }}
                        className={cn(
                          "-ml-px block border-l py-1 pl-3 text-sm transition-colors",
                          activeId === child.id
                            ? "border-primary font-medium text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollTo(child.id);
                        }}
                      >
                        {child.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );

  if (variant === "collapsible") {
    return (
      <details className="mb-8 rounded-lg border border-border px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">{label}</summary>
        {nav}
      </details>
    );
  }

  return nav;
}
