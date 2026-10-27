import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const siteUrl = "https://ai-skills-academy-eosin.vercel.app";

const courses = {
  prompting: {
    title: "Prompt Engineering",
    short: "Write clearer instructions and create repeatable AI workflows.",
    description: "Learn how to plan prompts, provide context, set constraints, evaluate responses and turn useful prompts into repeatable workflows.",
    outcomes: ["Structure clear prompts for real tasks", "Improve results with context and examples", "Check AI outputs for accuracy and gaps", "Build a reusable prompt library"],
  },
  video: {
    title: "AI Video Creation",
    short: "Turn ideas into short videos, explainers and stories.",
    description: "Explore a beginner-friendly workflow for planning, scripting, generating, editing and preparing AI-assisted videos.",
    outcomes: ["Develop a short video concept and hook", "Prepare a script and visual plan", "Explore text-to-video and image-to-video workflows", "Review and export a finished draft"],
  },
  graphics: {
    title: "AI Graphics & Design",
    short: "Create campaign visuals, thumbnails and social content.",
    description: "Learn a practical design workflow covering visual briefs, layout, typography, colour, AI-assisted concepts and export checks.",
    outcomes: ["Turn a brief into a visual direction", "Create social graphics and thumbnails", "Check contrast, spacing and readability", "Export assets for their intended platforms"],
  },
  websites: {
    title: "AI-Assisted Websites",
    short: "Plan, build and prepare websites for publishing with AI-assisted tools.",
    description: "Follow a website-building process from goals and page structure to content, responsive checks, accessibility and launch preparation.",
    outcomes: ["Define a website goal and audience", "Map pages and draft useful content", "Review responsive and accessible layouts", "Prepare a launch checklist"],
  },
  "digital-products": {
    title: "Digital Products & E-books",
    short: "Create guides, prompt packs and practical digital resources.",
    description: "Explore how to scope, draft, design, review and package a useful digital product before choosing a sales platform.",
    outcomes: ["Choose a specific audience and problem", "Outline a practical guide or resource", "Design and quality-check a product", "Prepare a clear product description and delivery plan"],
  },
} as const;

type CourseSlug = keyof typeof courses;

export function generateStaticParams() {
  return Object.keys(courses).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in courses)) return {};
  const course = courses[slug as CourseSlug];
  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: {
      type: "website",
      url: `${siteUrl}/courses/${slug}`,
      title: `${course.title} | AI Skills Academy`,
      description: course.description,
      siteName: "AI Skills Academy",
    },
  };
}

export default async function CourseLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in courses)) notFound();
  const course = courses[slug as CourseSlug];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 text-slate-100 sm:py-20">
      <nav aria-label="Breadcrumb" className="mb-10 text-sm text-slate-400">
        <Link className="underline underline-offset-4 hover:text-cyan-300" href="/">AI Skills Academy</Link>
        <span aria-hidden="true"> / </span>
        <span>{course.title}</span>
      </nav>
      <article>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Learning pathway</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">{course.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{course.short}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#paths" className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Choose this pathway</Link>
          <Link href="/#video-library" className="inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-5 py-3 font-semibold text-white hover:border-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Explore free video previews</Link>
        </div>
        <section aria-labelledby="what-youll-practise" className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-9">
          <h2 id="what-youll-practise" className="text-2xl font-bold sm:text-3xl">What you’ll practise</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{course.description}</p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {course.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 leading-6">
                <span aria-hidden="true" className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-300">✓</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-8 max-w-3xl text-sm leading-6 text-slate-400">This page introduces the pathway. Paid access, when purchased, is for 365 days at ₦5,000 per selected pathway. Optional mentorship costs an additional ₦10,000. Full lesson availability should be confirmed before checkout.</p>
      </article>
    </main>
  );
}
