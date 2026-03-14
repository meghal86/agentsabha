import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        <p className="font-body text-xs uppercase tracking-[0.14em] text-neela/60">How it works</p>
        <h1 className="mt-3 font-display text-5xl text-neela md:text-7xl">
          Citizen to cluster to Parliament.
          <span className="mt-2 block font-hindi text-4xl md:text-6xl">नागरिक से संसद तक</span>
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["01", "Citizen submits", "WhatsApp or web intake captures the issue in any language."],
            ["02", "Agent clusters", "Embeddings, clustering, and badge assignment turn reports into constituency intelligence."],
            ["03", "MP reviews draft", "Rule 32-ready questions and weekly briefs are drafted for human filing."]
          ].map(([step, title, body]) => (
            <article key={step} className="border border-[#E2D4B0] bg-haath p-5">
              <div className="font-display text-5xl text-kesariya">{step}</div>
              <h2 className="mt-3 font-display text-3xl text-neela">{title}</h2>
              <p className="mt-3 font-body text-base leading-7 text-neela/75">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

