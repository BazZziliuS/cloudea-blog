import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft, Pencil } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProjectKindBadge } from "@/components/projects/project-card";
import { TableOfContents } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { absoluteUrl, getConfig, getEditUrl, getProjectContact, seo } from "@/lib/config";
import { findProject, getAllProjects, getProjectPosts } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { compileMDX } from "@/lib/mdx";
import { ogImageMetadata, ogImageUrl } from "@/lib/og";

export const revalidate = 3600;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return seo({ title: "Project Not Found", noIndex: true });

  const image = project.cover
    ? project.cover.startsWith("/")
      ? absoluteUrl(project.cover)
      : project.cover
    : ogImageUrl({ slug: project.slug, type: "project" });
  return {
    ...seo({ title: project.title, description: project.description, path: `/projects/${project.slug}` }),
    ...ogImageMetadata(project.title, project.description, image),
  };
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = findProject((await params).slug);
  if (!project) notFound();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.projects;
  const content = await compileMDX(project.content, { slug: project.slug, contentType: "projects", title: project.title });
  const posts = getProjectPosts(project.slug, locale);
  const contact = project.kind === "client" || project.status === "for-sale" ? getProjectContact(locale, t.order) : null;
  const editUrl = getEditUrl(project.sourcePath);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    dateCreated: project.date,
    keywords: project.stack.join(", "),
    author: { "@type": "Person", name: getConfig().themeConfig.footer.copyright },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="mx-auto flex max-w-6xl gap-10 px-6">
        <article className="min-w-0 flex-1 py-16">
          <Button variant="ghost" size="sm" className="-ml-3 gap-1 text-muted-foreground" asChild>
            <Link href="/projects">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {t.allProjects}
            </Link>
          </Button>

          <header className="mb-10 mt-6">
            <ProjectKindBadge project={project} t={t} />
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{project.title}</h1>
            {project.description && <p className="mt-3 text-lg text-muted-foreground">{project.description}</p>}

            {project.stack.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2" aria-label={t.stack}>
                {project.stack.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            )}

            {(project.links.length > 0 || contact) && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {contact && (
                  <Button asChild>
                    <a href={contact.href} target="_blank" rel="noopener noreferrer">
                      {contact.label}
                    </a>
                  </Button>
                )}
                {project.links.map((link) => (
                  <Button key={link.href} variant="outline" asChild>
                    <a href={link.href} {...(isExternal(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {link.label}
                      {isExternal(link.href) && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                    </a>
                  </Button>
                ))}
                {project.status === "for-sale" && project.price && (
                  <span className="text-lg font-semibold">
                    <span className="sr-only">{t.price}: </span>
                    {project.price}
                  </span>
                )}
              </div>
            )}
          </header>

          {project.cover && (
            // eslint-disable-next-line @next/next/no-img-element -- covers may be external
            <img src={project.cover} alt="" className="mb-10 w-full rounded-lg border border-border" />
          )}

          <div className="prose prose-neutral max-w-none dark:prose-invert">{content}</div>

          {posts.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <h2 className="mb-4 text-lg font-semibold">{t.posts}</h2>
              <ul className="space-y-3">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <span className="font-medium transition-colors group-hover:text-primary">{post.title}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{formatDate(post.date, locale)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {editUrl && (
            <div className="mt-10 border-t border-border pt-4">
              <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {dict.blog.editOnGithub}
              </a>
            </div>
          )}
        </article>

        <div className="hidden w-56 shrink-0 py-16 xl:block">
          <TableOfContents label={dict.blog.onThisPage} labels={dict.common} />
        </div>
      </div>
    </>
  );
}
