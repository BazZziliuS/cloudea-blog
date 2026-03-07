import Link from "next/link";
import { getDocsSidebar } from "@/lib/content";

export const metadata = {
  title: "Documentation - Cloudea",
  description: "Guides and reference documentation",
};

export default function DocsPage() {
  const sidebar = getDocsSidebar();

  // If there are docs, we could redirect to the first one,
  // but showing an overview is more user-friendly.

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Explore guides, tutorials, and reference materials.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {sidebar.map((category) => {
          const formattedName =
            category.name.charAt(0).toUpperCase() +
            category.name.slice(1).replace(/-/g, " ");

          return (
            <div
              key={category.name}
              className="rounded-lg border border-border p-6"
            >
              <h2 className="text-xl font-semibold">{formattedName}</h2>
              <ul className="mt-4 space-y-2">
                {category.docs.map((doc) => (
                  <li key={doc.slug.join("/")}>
                    <Link
                      href={`/docs/${doc.slug.join("/")}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
