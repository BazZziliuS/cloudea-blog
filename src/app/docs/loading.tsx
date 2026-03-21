export default function DocsLoading() {
  return (
    <div className="py-10 animate-pulse">
      <div className="h-10 w-56 rounded bg-muted" />
      <div className="mt-3 h-6 w-96 rounded bg-muted" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-5">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="mt-1 h-3 w-16 rounded bg-muted" />
            {i % 2 === 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <div className="h-5 w-16 rounded-full bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
