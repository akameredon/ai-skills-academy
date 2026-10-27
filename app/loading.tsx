export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-16" aria-busy="true">
      <div className="mb-8 h-10 w-56 animate-pulse rounded-lg bg-slate-800" />
      <div className="mb-4 h-16 max-w-2xl animate-pulse rounded-lg bg-slate-800" />
      <div className="mb-10 h-5 max-w-xl animate-pulse rounded bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70" />)}
      </div>
      <p className="sr-only">Loading academy content…</p>
    </main>
  );
}
