import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import { seo } from "@/lib/config";
import { getAllProjects, PROJECT_KINDS, type ProjectKind } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { ogImageMetadata, ogImageUrl } from "@/lib/og";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { projects } = getDictionary(await getLocale());
  return {
    ...seo({ title: projects.title, description: projects.subtitle, path: "/projects" }),
    ...ogImageMetadata(projects.title, projects.subtitle, ogImageUrl({ slug: "projects", type: "page" })),
  };
}

interface ProjectsPageProps {
  searchParams: Promise<{ kind?: string | string[] }>;
}

function isProjectKind(value: unknown): value is ProjectKind {
  return typeof value === "string" && (PROJECT_KINDS as readonly string[]).includes(value);
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const t = getDictionary(await getLocale()).projects;
  const { kind } = await searchParams;
  const activeKind = isProjectKind(kind) ? kind : null;

  const allProjects = getAllProjects();
  const kinds = PROJECT_KINDS.filter((k) => allProjects.some((project) => project.kind === k));
  const projects = activeKind ? allProjects.filter((project) => project.kind === activeKind) : allProjects;

  const filters = [
    { href: "/projects", label: t.all, active: !activeKind, count: allProjects.length },
    ...kinds.map((k) => ({
      href: `/projects?kind=${k}`,
      label: t.kindsPlural[k],
      active: activeKind === k,
      count: allProjects.filter((project) => project.kind === k).length,
    })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t.subtitle}</p>
      </header>

      {kinds.length > 1 && (
        <nav className="mb-8 flex flex-wrap gap-2" aria-label={t.title}>
          {filters.map((filter) => (
            <Link
              key={filter.href}
              href={filter.href}
              aria-current={filter.active ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                filter.active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {filter.label}
              <span className="ml-1.5 opacity-70">{filter.count}</span>
            </Link>
          ))}
        </nav>
      )}

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
