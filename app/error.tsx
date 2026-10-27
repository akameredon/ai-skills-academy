"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("AI Skills Academy route error:", error); }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-start justify-center px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-bold text-white">We couldn’t load this page.</h1>
      <p className="mt-4 text-slate-300">Try again, or return to the academy homepage. Payment verification remains the responsibility of the secure checkout service.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => reset()} className="min-h-11 rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Try again</button>
        <a href="/" className="min-h-11 rounded-lg border border-slate-600 px-5 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Go to homepage</a>
      </div>
    </main>
  );
}
