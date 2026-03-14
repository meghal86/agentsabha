import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

const screens = [
  ["01 Homepage", "/prototype/index.html"],
  ["02 Dashboard", "/prototype/dashboard.html"],
  ["03 Submit", "/prototype/submit.html"],
  ["04 Parliament", "/prototype/parliament.html"],
  ["05 Mobile", "/prototype/mobile.html"],
  ["06 Components", "/prototype/components.html"],
  ["07 Art System", "/prototype/art-system.html"],
  ["08 Map First", "/prototype/map-first.html"]
] as const;

export default function PrototypePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <p className="font-body text-xs uppercase tracking-[0.14em] text-neela/60">Approved prototype</p>
        <h1 className="mt-3 font-display text-5xl text-neela md:text-7xl">Screens 01-08 remain preserved exactly while the production app is built.</h1>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {screens.map(([label, href]) => (
            <Link key={href} href={href} className="border border-[#E2D4B0] bg-haath p-5">
              <div className="font-display text-3xl text-neela">{label}</div>
              <div className="mt-2 font-body text-sm uppercase tracking-[0.08em] text-neela/60">{href}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

