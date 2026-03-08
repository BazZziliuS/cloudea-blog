export default function DocsLoading() {
  return (
    <div className="py-10 animate-pulse">
      <div className="h-10 w-56 rounded bg-muted" />
      <div className="mt-3 h-6 w-96 rounded bg-muted" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-6">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
