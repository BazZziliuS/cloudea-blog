function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
      <div className="mt-3 h-6 w-3/4 rounded bg-muted" />
      <div className="mt-2 space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-14 rounded-full bg-muted" />
        <div className="h-5 w-18 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 animate-pulse">
        <div className="h-10 w-48 rounded bg-muted" />
        <div className="mt-2 h-6 w-80 rounded bg-muted" />
      </div>

      <div className="flex gap-10">
        <div className="min-w-0 flex-1">
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>

        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-8 animate-pulse">
            <div>
              <div className="h-4 w-16 rounded bg-muted mb-3" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-7 w-16 rounded-md bg-muted" />
                ))}
              </div>
            </div>
            <div>
              <div className="h-4 w-32 rounded bg-muted mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-full rounded-md bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
