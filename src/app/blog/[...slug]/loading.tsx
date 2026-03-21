export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 flex gap-10">
      <article className="min-w-0 flex-1 py-16 animate-pulse">
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded bg-muted" />
              <div className="h-8 w-8 rounded bg-muted" />
            </div>
          </div>

          <div className="mt-4 h-10 w-4/5 rounded bg-muted" />
          <div className="mt-3 h-6 w-3/5 rounded bg-muted" />

          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-6 w-14 rounded-full bg-muted" />
          </div>
        </header>

        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-11/12 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="mt-6 h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="mt-6 h-48 w-full rounded-lg bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>

        {/* Edit on GitHub */}
        <div className="mt-10 border-t border-border pt-4">
          <div className="h-4 w-56 rounded bg-muted" />
        </div>

        {/* Related posts */}
        <div className="mt-10 border-t border-border pt-8">
          <div className="h-6 w-36 rounded bg-muted mb-4" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="mt-2 h-5 w-full rounded bg-muted" />
                <div className="mt-1 h-5 w-3/4 rounded bg-muted" />
                <div className="mt-3 flex gap-1">
                  <div className="h-5 w-12 rounded-full bg-muted" />
                  <div className="h-5 w-14 rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* TOC sidebar */}
      <div className="hidden xl:block w-56 shrink-0 py-16 animate-pulse">
        <div className="sticky top-20">
          <div className="h-4 w-28 rounded bg-muted mb-3" />
          <div className="space-y-2 border-l border-border pl-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-3.5 rounded bg-muted" style={{ width: `${60 + (i % 3) * 20}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
