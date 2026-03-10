import { getDocsSidebar, getDocsIndex } from "@/lib/content";
import { Sidebar } from "@/components/sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = getDocsSidebar();
  const docsIndex = getDocsIndex();

  return (
    <div className="mx-auto flex max-w-7xl px-6">
      {/* Sidebar */}
      <aside className="hidden md:block w-[280px] shrink-0 border-r border-border pr-6">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar categories={sidebar} indexTitle={docsIndex?.title} />
        </div>
      </aside>

      {/* Main content area */}
      <main className="min-w-0 flex-1 pl-0 md:pl-8">{children}</main>
    </div>
  );
}
