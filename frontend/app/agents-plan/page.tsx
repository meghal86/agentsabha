import { AgentsPlanLive } from "@/components/agents-plan-live";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDebugAgents } from "@/lib/api";

export default async function AgentsPlanPage() {
  const debug = await getDebugAgents().catch(() => ({ agents: [] }));
  return (
    <div className="page-shell">
      <SiteHeader active="agents" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <AgentsPlanLive initialDebugAgents={debug.agents} />
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · 46-agent roadmap separated from the live product surface" />
    </div>
  );
}
