import { IssueLedger } from "@/components/issue-ledger";
import { QuestionLog } from "@/components/question-log";
import { SeverityBar } from "@/components/severity-bar";
import { SiteHeader } from "@/components/site-header";

export default function ConstituencyPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="border-b border-[#E2D4B0] pb-6">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-neela/50">India → Uttar Pradesh → Constituency {params.id}</p>
          <h1 className="mt-3 font-display text-5xl text-neela md:text-7xl">Varanasi</h1>
          <p className="mt-1 font-hindi text-3xl text-neela/80 md:text-5xl">वाराणसी</p>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="border border-[#E2D4B0] bg-haath p-5">
              <h2 className="font-display text-3xl text-neela">Category severity</h2>
              <div className="mt-4">
                <SeverityBar
                  items={[
                    { label: "सड़क", value: 82, tone: "#C8592A" },
                    { label: "पानी", value: 63, tone: "#2B7A8B" },
                    { label: "स्वास्थ्य", value: 44, tone: "#2D6A4F" }
                  ]}
                />
              </div>
            </div>
            <div className="border border-neela bg-neela p-5 text-haath">
              <p className="font-display text-3xl">Agent Varanasi</p>
              <p className="mt-2 font-body text-sm uppercase tracking-[0.08em] text-kesariya">Active / सक्रिय</p>
            </div>
          </aside>
          <div className="space-y-8">
            <IssueLedger />
            <QuestionLog />
          </div>
        </div>
      </section>
    </main>
  );
}

