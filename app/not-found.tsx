export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-start justify-center px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">404 · Page not found</p>
      <h1 className="mt-4 text-4xl font-bold text-white">This learning page isn’t here yet.</h1>
      <p className="mt-4 text-slate-300">The link may be outdated, or the page may have moved. Return to the academy to choose a learning pathway.</p>
      <a href="/" className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Back to AI Skills Academy</a>
    </main>
  );
}
