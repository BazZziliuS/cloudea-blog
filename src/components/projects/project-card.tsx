import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ProjectLabels = Dictionary["projects"];

const MAX_STACK_BADGES = 4;

export function ProjectKindBadge({ project, t }: { project: Project; t: ProjectLabels }) {
  return (
    <span className="text-xs text-muted-foreground">
      {t.kinds[project.kind]}
      {project.status !== "active" && (
        <span className={cn("ml-2", project.status === "for-sale" ? "text-primary" : "")}>
          · {t.statuses[project.status]}
        </span>
      )}
    </span>
  );
}

export function ProjectCard({ project, t }: { project: Project; t: ProjectLabels }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
    >
      {project.cover && (
        <div className="aspect-[16/9] overflow-hidden border-b border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- covers may be external */}
          <img
            src={project.cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <ProjectKindBadge project={project} t={t} />
        <h3 className="mt-2 text-lg font-semibold transition-colors group-hover:text-primary">{project.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{project.description}</p>
        {(project.stack.length > 0 || (project.status === "for-sale" && project.price)) && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {project.stack.slice(0, MAX_STACK_BADGES).map((item) => (
              <Badge key={item} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
            {project.status === "for-sale" && project.price && (
              <span className="ml-auto text-sm font-semibold text-foreground">{project.price}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/** Compact card used inside blog posts: "This post is about <project>". */
export function ProjectMention({ project, t }: { project: Project; t: ProjectLabels }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group mb-8 flex items-center justify-between gap-4 rounded-lg border border-border bg-accent/30 p-4 transition-colors hover:border-primary/50"
    >
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{t.aboutProject}</p>
        <p className="mt-0.5 truncate font-semibold transition-colors group-hover:text-primary">{project.title}</p>
        <p className="truncate text-sm text-muted-foreground">{project.description}</p>
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}
