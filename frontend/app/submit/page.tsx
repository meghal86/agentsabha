import { SiteHeader } from "@/components/site-header";

export default function SubmitPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <div className="border border-[#E2D4B0] bg-haath p-6 md:p-8">
          <p className="font-hindi text-5xl text-neela">अपनी समस्या दर्ज करें</p>
          <h1 className="mt-3 font-display text-4xl text-neela md:text-5xl">Submit Your Issue</h1>
          <div className="mt-8 space-y-6">
            <div>
              <label className="font-body text-xs uppercase tracking-[0.14em] text-neela/60">Constituency</label>
              <input className="mt-2 w-full border border-neela bg-haldi px-4 py-3 font-body text-base outline-none" placeholder="PIN code ya constituency ka naam..." />
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-[0.14em] text-neela/60">Issue</label>
              <textarea className="mt-2 min-h-48 w-full border border-neela bg-haldi px-4 py-3 font-body text-base outline-none" placeholder="Hindi, English, ya apni bhasha mein likhein..." />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="border border-neela px-4 py-2 font-body text-sm font-semibold uppercase tracking-[0.08em] text-neela">Voice input</button>
              <button className="border border-neela px-4 py-2 font-body text-sm font-semibold uppercase tracking-[0.08em] text-neela">Photo upload</button>
            </div>
            <button className="w-full border border-neela bg-neela px-5 py-4 font-display text-2xl font-semibold text-haath shadow-[0_3px_0_0_#FF9933]">
              Submit / दर्ज करें →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

