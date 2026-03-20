import { AgentsPlanLive } from "@/components/agents-plan-live";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getRoadmapRuntime } from "@/lib/api";

export default async function AgentsPlanPage() {
  const runtime = await getRoadmapRuntime()
    .then((payload) => ({ agents: payload.agents, backendAvailable: true, generatedAt: payload.generated_at }))
    .catch(() => ({ agents: [], backendAvailable: false, generatedAt: null }));
  return (
    <div className="page-shell">
      <SiteHeader active="agents" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <AgentsPlanLive
            initialRuntimeAgents={runtime.agents}
            initialBackendAvailable={runtime.backendAvailable}
            initialGeneratedAt={runtime.generatedAt}
          />
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · 46-agent roadmap separated from the live product surface" />
    </div>
  );
}
