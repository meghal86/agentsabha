import { AgentsStatusLive } from "@/components/agents-status-live";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDebugAgents } from "@/lib/api";

export default async function AgentsDebugPage() {
  const debug = await getDebugAgents().catch(() => ({ agents: [] }));

  return (
    <div className="page-shell">
      <SiteHeader active="agents" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <AgentsStatusLive initialDebugAgents={debug.agents} />
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Debug view of implemented and deferred agents" />
    </div>
  );
}
