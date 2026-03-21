export default function DocPageLoading() {
  return (
    <div className="flex gap-10">
      <div className="min-w-0 flex-1 py-10 animate-pulse">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-4 w-3 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-4 w-3 rounded bg-muted" />
          <div className="h-4 w-28 rounded bg-muted" />
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="h-9 w-3/5 rounded bg-muted" />
          <div className="mt-2 h-5 w-2/5 rounded bg-muted" />
        </header>

        {/* Content */}
        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-11/12 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="mt-6 h-7 w-48 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="mt-6 h-36 w-full rounded-lg bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-border pt-4 flex items-center justify-between">
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="h-4 w-44 rounded bg-muted" />
        </div>
      </div>

      {/* TOC sidebar */}
      <div className="hidden xl:block w-56 shrink-0 py-10 animate-pulse">
        <div className="sticky top-20">
          <div className="h-4 w-28 rounded bg-muted mb-3" />
          <div className="space-y-2 border-l border-border pl-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3.5 rounded bg-muted" style={{ width: `${60 + (i % 3) * 20}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
