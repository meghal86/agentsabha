import Link from "next/link";

import { IndiaMap } from "@/components/india-map";
import { IssueLedger } from "@/components/issue-ledger";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="kolam-field">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1fr_1.1fr] md:px-8 md:py-14">
          <div className="self-center">
            <p className="font-body text-xs uppercase tracking-[0.14em] text-neela/60">INDIA&apos;S CIVIC INTELLIGENCE PLATFORM</p>
            <h1 className="mt-4 font-display text-6xl leading-[0.95] text-neela md:text-8xl">
              <span className="block">543 AI Agents.</span>
              <span className="block font-hindi">एक संसद।</span>
              <span className="block text-kesariya">A Billion Voices.</span>
            </h1>
            <p className="mt-6 max-w-xl font-body text-lg leading-8 text-neela/75">
              Phase 1 is the MP co-pilot wedge: citizen issue intake, clustering, draft parliamentary questions, and auditable public intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/submit" className="border border-neela bg-neela px-5 py-4 font-display text-xl font-semibold text-haath shadow-[0_3px_0_0_#FF9933]">
                Submit Your Issue
              </Link>
              <Link href="/prototype" className="border border-neela px-5 py-4 font-body text-sm font-semibold uppercase tracking-[0.08em] text-neela">
                View Approved Screens
              </Link>
            </div>
          </div>
          <IndiaMap />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 md:px-8">
        <div className="mandate-rule mb-8 pt-6" />
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <IssueLedger />
          <div className="border border-[#E2D4B0] bg-haath p-5">
            <p className="font-body text-xs uppercase tracking-[0.14em] text-neela/50">Build status</p>
            <h2 className="mt-3 font-display text-4xl text-neela">Production foundation is now being built around the approved design system.</h2>
            <p className="mt-4 font-body text-base leading-7 text-neela/75">
              The repo now contains a FastAPI backend scaffold, a Next.js frontend shell, session handoff files, and the preserved prototype screens 01-08 for zero-regression comparison.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

