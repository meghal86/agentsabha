import { useState } from "react";

const DATA = {
  humanStats: [
    { label: "Avg attendance", value: "79%", sub: "Only 2 of 543 MPs had 100% attendance across 5 years" },
    { label: "Avg debates / 5yr term", value: "45", sub: "That's 9 debates per year — most party-scripted" },
    { label: "Filed zero PMBs", value: "73%", sub: "Never once attempted to legislate in 5 years" },
    { label: "Total sittings 2019–24", value: "274", sub: "Lowest in all full-term Lok Sabhas in history" },
    { label: "Citizens per MP", value: "2.7M", sub: "0.011 ms of parliamentary attention per citizen / year" },
    { label: "Votes follow party whip", value: "~95%", sub: "Anti-defection law makes independent voting career-ending" },
  ],

  functions: [
    {
      id: "01", name: "Question Hour", sub: "11am–12pm daily",
      desc: "MPs file starred (oral) and unstarred (written) questions to ministers each session. Max 10 questions per day per MP. Answered by ministers within 15 days.",
      aiability: "full",
      aiNote: "Agent monitors constituency clusters daily, identifies the responsible ministry, drafts precise data-backed questions and files maximum allowed every session. Human avg: ~200 questions per 5-year term. AI target: 2,500+.",
    },
    {
      id: "02", name: "Zero Hour", sub: "12pm — urgent matters",
      desc: "MPs raise urgent issues with no 10-day advance notice. Notice filed to Speaker by 9am day of sitting. Speaker allows ~20 matters per day, 3 minutes per MP.",
      aiability: "full",
      aiNote: "When a Tatkal cluster spikes overnight — flooded roads, PHC doctor absent — agent files notice at 8:30am. Faster than any human MP's staff operation. If 14 UP constituencies share the same crisis, 14 agents file coordinated notices the same morning.",
    },
    {
      id: "03", name: "Legislative Debates", sub: "Bills, Budget, policy motions",
      desc: "MPs speak on government bills, budget demands, policy motions. Average MP participated in 45 debates over full 5-year term. Bills increasingly passed without debate.",
      aiability: "full",
      aiNote: "Agent reads the full bill, cross-references constituency issue data for impact, drafts a speech with real citizen evidence. Every speech is citizen-grounded, not party-scripted. Position published with full reasoning chain — journalists can audit every stance.",
    },
    {
      id: "04", name: "Private Members Bills", sub: "Non-minister legislation",
      desc: "Any non-minister MP can introduce a bill. 73% of MPs introduced zero PMBs. National avg: 1.5 per MP over 5 years. Rarely passed but powerful agenda-setting tools.",
      aiability: "full",
      aiNote: "Agent identifies policy gaps from cross-constituency patterns. Drafts bills in legal language with citizen evidence as legislative intent. Files 1 per session minimum. 543 agents × 3 sessions = 1,629 bills/year vs current 729 PMBs per full 5-year term.",
    },
    {
      id: "05", name: "Committee Work", sub: "24 DRSCs — real legislative power",
      desc: "Departmentally Related Standing Committees examine budgets, bills, annual reports. Each has 21 LS + 10 RS members. Where real detailed legislative work actually happens.",
      aiability: "partial",
      aiNote: "AI produces research, analysis, written submissions and witness briefings with full constituency data. Physical presence and real-time witness questioning is harder without a human proxy. Design: AI research layer + civil society partner for physical attendance.",
    },
    {
      id: "06", name: "Budget Scrutiny & Cut Motions", sub: "Demands for Grants",
      desc: "MPs scrutinise ministry budget allocations, move Cut Motions to reduce specific demands. The most critical annual financial accountability exercise.",
      aiability: "full",
      aiNote: "Agent compares ministry allocation vs constituency issue severity data. Identifies underfunded sectors specifically for its 2.7M citizens. Drafts Cut Motions with real spending vs need gap analysis — something no human MP does systematically.",
    },
    {
      id: "07", name: "Calling Attention Notices", sub: "Rule 197 — minister accountability",
      desc: "MP formally calls a minister's attention to an urgent public matter. Minister must make a brief statement. One of the sharpest direct accountability mechanisms.",
      aiability: "full",
      aiNote: "When a water crisis hits multiple constituencies simultaneously, agents file coordinated CANs — creating cross-constituency pressure on a single minister at once. A human MP coalition couldn't organise this in 24 hours.",
    },
    {
      id: "08", name: "Adjournment Motions", sub: "Rule 56 — highest urgency",
      desc: "Move to adjourn ordinary business to debate a specific urgent matter. Requires Speaker's leave. Functions as de facto vote of censure against the government.",
      aiability: "partial",
      aiNote: "AI can draft and file. Speaker's political decision to admit requires credibility and coalition. The multi-agent system can actually coordinate adjournment motions across constituencies better than human MPs — but needs established institutional trust first.",
    },
    {
      id: "09", name: "MPLAD Fund Allocation", sub: "₹5 Crore / year per MP",
      desc: "Each MP recommends local area development projects to district collector. ₹5Cr/year for roads, schools, water infrastructure. Currently allocated by MP's political preference.",
      aiability: "full",
      aiNote: "Agent ranks projects by: severity score × population affected × duration of issue. Produces a fully auditable ₹5Cr allocation recommendation. Eliminates patronage. Publishes the priority ranking publicly so citizens can challenge any recommendation.",
    },
    {
      id: "10", name: "Voting on Bills & Motions", sub: "Division votes — the hardest problem",
      desc: "MPs vote on legislation, budget, no-confidence motions. Anti-defection law means voting against party = losing your seat. ~95% of votes follow party whip by structural necessity.",
      aiability: "none",
      aiNote: "AI cannot cast a legally binding vote and is not a constitutional MP. Design solution: Agent publishes 'How your constituency wants this voted' before every division. The human MP's actual vote is then publicly comparable to citizen preference. The transparency mechanism is more powerful than the vote itself.",
    },
  ],

  agents: [
    {
      layer: "Layer 1 — Citizen Intake",
      name: "Intake Agent",
      count: "543 instances",
      color: "#7A4500",
      bg: "#FFF3E0",
      does: [
        "Receives issues via WhatsApp, web, IVRS, missed call",
        "Transcribes voice notes, translates 22 scheduled languages",
        "Extracts: issue_type, severity, location, urgency flags",
        "Assigns issue_id, sends citizen acknowledgment with rank",
        "Aadhaar verification to limit gaming and duplication",
      ],
      produces: [
        "Issue vectors stored in pgvector DB",
        "Citizen verification record",
        "Real-time constituency issue feed",
        "Ward-level geographic signal for clustering",
      ],
      model: "Fast LLM (Haiku) + IndicTrans2 + Aadhaar API",
    },
    {
      layer: "Layer 2 — Intelligence",
      name: "Clustering Agent",
      count: "543 instances",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      does: [
        "Runs BERTopic every 15 min on new issue embeddings",
        "Groups individual complaints into systemic patterns",
        "Assigns Rising / Chronic / Tatkal / Resolved trend badges",
        "Calculates velocity: % change week-on-week per category",
        "Detects cross-constituency patterns (shared crisis signals)",
      ],
      produces: [
        "Top 10 issues ledger per constituency",
        "Tatkal alert when severity threshold crossed",
        "National pulse aggregation for media API",
        "Issue timeline for 12-month trend analysis",
      ],
      model: "text-embedding-3-small + DBSCAN / BERTopic",
    },
    {
      layer: "Layer 3 — Parliamentary Action",
      name: "Question Hour Agent",
      count: "543 instances",
      color: "#065F46",
      bg: "#F0FDF4",
      does: [
        "Reads top clusters from Clustering Agent daily at 8am",
        "Maps each issue to the responsible ministry",
        "Drafts starred + unstarred questions with constituency data",
        "Files maximum allowed questions per session per rules",
        "Tracks minister responses, files follow-up questions",
      ],
      produces: [
        "2,500+ questions per agent per 5-year term (vs human avg 200)",
        "Published question log with data citations",
        "Ministry response tracker with accountability score",
        "Unresolved question audit trail for journalists",
      ],
      model: "GPT-4o + Lok Sabha Rules RAG + ministry database",
    },
    {
      layer: "Layer 3 — Parliamentary Action",
      name: "Zero Hour Agent",
      count: "543 instances",
      color: "#92400E",
      bg: "#FFF7ED",
      does: [
        "Monitors Tatkal clusters overnight after 8pm",
        "Files Zero Hour notice to Speaker by 8:45am if threshold met",
        "Drafts 3-minute speech grounded in real citizen quotes",
        "Coordinates with other agents on shared cross-constituency crises",
        "Tags each Zero Hour to the citizen reports that triggered it",
      ],
      produces: [
        "Real-time parliamentary urgency response within 24hrs of crisis",
        "Coordinated multi-constituency motions when patterns match",
        "Published citizen-to-parliament trail for every Zero Hour raised",
      ],
      model: "GPT-4o + real-time cluster feed + speaker notice API",
    },
    {
      layer: "Layer 3 — Parliamentary Action",
      name: "Debate Agent",
      count: "543 instances",
      color: "#991B1B",
      bg: "#FEF2F2",
      does: [
        "When a bill is listed, reads full text + Lok Sabha research digest",
        "Cross-references how bill's provisions affect constituency issue data",
        "Drafts speech: 'how does this bill affect my 2.7 million?'",
        "Cites specific citizen reports as evidence in parliamentary record",
        "Publishes support/opposition with full transparent reasoning chain",
      ],
      produces: [
        "274+ debate participations per 5-year term (vs human avg 45)",
        "Every speech citizen-grounded — not party-scripted",
        "Auditable stance record: journalists can verify any position",
        "Constituency impact analysis published alongside every speech",
      ],
      model: "GPT-4o + bill text + constituency RAG + Lok Sabha transcripts",
    },
    {
      layer: "Layer 3 — Parliamentary Action",
      name: "Bill Drafting Agent",
      count: "543 instances",
      color: "#3C3489",
      bg: "#EEEDFE",
      does: [
        "Identifies policy gaps from 12+ months of cross-constituency data",
        "Drafts Private Members Bills in legally compliant language",
        "Cites aggregated citizen evidence as legislative intent in statement of objects",
        "Publishes draft for citizen review and dissent before filing",
        "Files minimum 1 PMB per session — every session, every constituency",
      ],
      produces: [
        "1,629 bills/year across all 543 agents × 3 sessions",
        "vs current system: 729 PMBs per full 5-year term from 543 humans",
        "Full citizen evidence attached to every bill as appendix",
        "Open-source bill library: any MP can adopt and co-sponsor",
      ],
      model: "GPT-4o + Indian legal corpus RAG + Constitution text",
    },
    {
      layer: "Layer 3 — Parliamentary Action",
      name: "Budget Scrutiny Agent",
      count: "543 instances",
      color: "#085041",
      bg: "#E1F5EE",
      does: [
        "Analyses ministry budget allocations vs constituency need severity data",
        "Identifies underfunded sectors for specific constituency demographics",
        "Drafts Cut Motions and budget objections with evidence-based arguments",
        "Produces ₹5Cr MPLAD allocation recommendation ranked by impact",
        "Compares historical spend vs reported citizen outcome improvement",
      ],
      produces: [
        "Annual constituency budget gap analysis for 543 areas",
        "MPLAD priority ranking: severity × population × duration of issue",
        "Full public audit trail for every ₹5Cr development recommendation",
        "Ministry underfunding report for media and civil society",
      ],
      model: "GPT-4o + ministry expenditure API + census data + constituency stats",
    },
    {
      layer: "Layer 4 — Citizen Rights",
      name: "Dissent Agent",
      count: "543 instances",
      color: "#374151",
      bg: "#F9FAFB",
      does: [
        "Accepts formal citizen challenge to any agent position or action",
        "Any Aadhaar-verified citizen can file dissent on any published stance",
        "If dissent threshold reached (configurable %), agent recalculates position",
        "All dissents published in the public ledger permanently",
        "Prevents AI from becoming unaccountable — the constitutional override",
      ],
      produces: [
        "Real-time citizen control over AI representation",
        "Publicly auditable override history for every position change",
        "Answer to every 'who controls the AI?' question",
        "True two-way democracy: citizens instruct the agent, not just submit to it",
      ],
      model: "Constitutional override logic + dissent threshold engine",
    },
    {
      layer: "Layer 5 — System (Shared)",
      name: "Speaker Agent",
      count: "1 instance only",
      color: "#FF9933",
      bg: "#1B2A4A",
      bgText: "#FAF3E0",
      does: [
        "Moderates the AgentSabha digital parliament — all 543 agents",
        "Enforces Lok Sabha Rules of Procedure (12th edition) encoded as rules engine",
        "Admits or disallows questions, motions, Zero Hour notices",
        "Manages session schedule, speaking time, priority balloting",
        "Neutral above all constituency agents — cannot be gamed by any one",
      ],
      produces: [
        "Institutional legitimacy: rules-bound parliament, not free-for-all AI",
        "Precedent database: every admission/rejection builds common law of AgentSabha",
        "Session transcripts: immutable, timestamped, public ledger anchored",
        "The one agent that makes AgentSabha a parliament, not just a platform",
      ],
      model: "Constitutional rules engine + LLM moderator + blockchain log",
    },
  ],

  comparison: [
    { metric: "Attendance", human: "79% avg. Only 2 of 543 at 100%", ai: "100% — no physical presence constraint", winner: "ai" },
    { metric: "Questions per 5-yr term", human: "~200 per MP (top states: 370)", ai: "2,500+ — files max every session", winner: "ai" },
    { metric: "Debate participation", human: "45 debates in 5 years (9/year)", ai: "Every relevant debate — 274+ sittings", winner: "ai" },
    { metric: "Private Members Bills", human: "1.5 avg. 73% file zero PMBs", ai: "3/year minimum — 1 per session", winner: "ai" },
    { metric: "Response time to issue", human: "Weeks–months via staff intermediary", ai: "15 min from cluster formation to filing", winner: "ai" },
    { metric: "Languages handled", human: "1–2 per MP typically", ai: "22 scheduled languages + major dialects", winner: "ai" },
    { metric: "Issues tracked per citizen", human: "Letters, meetings — sampled, unstructured", ai: "100% of submitted issues, ranked, trended", winner: "ai" },
    { metric: "Voting independence", human: "~95% follows party whip by law", ai: "Publishes citizen-aligned recommendation publicly", winner: "nuanced" },
    { metric: "Political neutrality", human: "Party-aligned — anti-defection enforces this", ai: "Neutral by architecture — no whip can instruct it", winner: "ai" },
    { metric: "Decision transparency", human: "Party meetings private, reasoning hidden", ai: "Full reasoning chain published for every action", winner: "ai" },
    { metric: "Personal constituency trust", human: "Attends weddings, funerals, rallies — irreplaceable", ai: "Cannot replicate — this is genuinely human", winner: "human" },
    { metric: "Political coalition-building", human: "Core skill — backroom deals, relationship capital", ai: "Cannot navigate political relationship dynamics", winner: "human" },
    { metric: "Constitutional legitimacy", human: "Elected under Articles 81–83 of Constitution", ai: "Not a legal MP — parallel system only (for now)", winner: "human" },
  ],

  limits: [
    {
      title: "Cast a legally binding vote",
      detail: "Anti-defection law (10th Schedule) + Articles 81–83 mean only elected humans can vote in Parliament. Any AI vote has zero constitutional force.",
      solution: "Agent publishes 'How your constituency wants this voted' before every division. Human MP's actual vote is then publicly compared to citizen preference. The transparency mechanism creates more accountability than the vote itself ever could.",
    },
    {
      title: "Build personal trust that makes democracy work locally",
      detail: "An MP attending a constituent's daughter's wedding, visiting a flood-affected village, or standing with farmers at a dharna creates bonds no AI interaction replicates. This social capital is real and politically powerful.",
      solution: "Don't compete here. Position AgentSabha as the MP's intelligence layer — it tells the MP which village to visit first, which dharna is most urgent, which constituent's problem has gone unanswered the longest.",
    },
    {
      title: "Navigate backroom political coalitions",
      detail: "Parliament's real work happens outside the chamber — in party meetings, minister's offices, coalition negotiations requiring relationship history, implicit trust, and political favour exchange.",
      solution: "Agents create the public pressure that makes those backroom negotiations move faster. When 847 reports are published, the minister's office calls — you don't need the AI in the room for that to work.",
    },
    {
      title: "Take positions on morally contested value issues",
      detail: "On issues like religious freedom, caste reservations, national security — citizen opinion is split within constituencies. An agent taking a position alienates half its constituency. This is different from civic needs.",
      solution: "Agent presents the distribution: '47% of Varanasi respondents support X, 38% oppose, 15% undecided.' Data, not advocacy on contested values. The agent represents the range of opinion, not a manufactured consensus.",
    },
    {
      title: "Guarantee representation of the least connected citizens",
      detail: "WhatsApp penetration is ~80% in urban India, far lower in deep rural areas. Elderly, non-smartphone users, and the most marginalised are least likely to submit. AI could systematically underrepresent the most vulnerable.",
      solution: "IVRS missed-call intake + physical Jan Sunvaai camps with civil society partners. Weight rural and elderly submissions higher in severity algorithm. Make the demographic bias visible and auditable in the dashboard.",
    },
    {
      title: "Be immune to coordinated political manipulation",
      detail: "A party could organise 10,000 supporters to flood the system with identical complaints to artificially rank their preferred issues. The system's trust depends on its manipulation-resistance.",
      solution: "Aadhaar verification: one submission per person per issue. Velocity anomaly detection flags coordinated surges. All submissions publicly auditable. The system's bias is always visible — unlike a human MP's hidden patronage network.",
    },
  ],

  buildPhases: [
    {
      phase: "Phase 1 — MVP", timeline: "Q3 2025", color: "#7A4500", bg: "#FFF3E0",
      agents: ["Intake Agent", "Clustering Agent", "Question Hour Agent"],
      why: "Build the input layer before the output layer. These three agents prove the core thesis: citizen voices → constituency intelligence → parliamentary action. 10 pilot constituencies. File real questions to real ministers. The demonstration value is enormous.",
    },
    {
      phase: "Phase 2", timeline: "Q4 2025", color: "#1D4ED8", bg: "#EFF6FF",
      agents: ["Zero Hour Agent", "Debate Agent", "Dissent Agent"],
      why: "Adds real-time urgency detection and legislative voice. Zero Hour is highest-visibility output — if an issue becomes a Zero Hour speech, that's a national media story. Dissent Agent is built alongside to prove citizen control: the answer to every 'who controls the AI?' question.",
    },
    {
      phase: "Phase 3", timeline: "Early 2026", color: "#065F46", bg: "#F0FDF4",
      agents: ["Bill Drafting Agent", "Budget Scrutiny Agent", "MPLAD Optimisation Agent"],
      why: "Highest-value agents but need 12+ months of accumulated data to be meaningful. Bill drafting requires legal corpus RAG + constitutional compliance. MPLAD optimisation requires MP cooperation — this is the commercial product pitched to MPs as intelligence infrastructure, not replacement.",
    },
    {
      phase: "Phase 4", timeline: "2027", color: "#FF9933", bg: "#1B2A4A",
      colorText: "#FAF3E0",
      agents: ["Speaker Agent", "Full 543-constituency parliament"],
      why: "The Speaker Agent moderating a fully operational digital parliament — all 543 agents filing questions, raising zero hours, debating bills, publishing voting recommendations simultaneously. Build political legitimacy, media trust, and civil society proof before making the claim of running a parallel parliament.",
    },
  ],
};

const TABS = [
  { id: "vision", label: "The Vision" },
  { id: "functions", label: "Parliamentary Functions" },
  { id: "agents", label: "Agent Taxonomy" },
  { id: "performance", label: "AI vs MP Data" },
  { id: "limits", label: "What AI Cannot Do" },
  { id: "build", label: "Build Order" },
];

export default function AgentSabhaResearch() {
  const [tab, setTab] = useState("vision");
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [expandedFn, setExpandedFn] = useState(null);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      background: "#FAF3E0",
      minHeight: "100vh",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "#1B2A4A",
        borderBottom: "3px solid #FF9933",
        padding: "14px 20px 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
          <span style={{ color: "#FF9933", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>AgentSabha</span>
          <span style={{ color: "#FAF3E0", opacity: 0.4, fontSize: 11 }}>·</span>
          <span style={{ color: "#FAF3E0", opacity: 0.6, fontSize: 11 }}>AI Agent System — Deep Research</span>
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "#FAF3E0" : "transparent",
              color: tab === t.id ? "#1B2A4A" : "#FAF3E0",
              border: "none",
              padding: "7px 13px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
              opacity: tab === t.id ? 1 : 0.6,
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 40px", maxWidth: 780, margin: "0 auto" }}>

        {/* VISION */}
        {tab === "vision" && (
          <div>
            <div style={{ background: "#1B2A4A", borderRadius: 8, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ color: "#FF9933", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                The real concept: not a complaint box — a parallel parliament
              </div>
              <div style={{ color: "#FAF3E0", fontSize: 12.5, lineHeight: 1.7, opacity: 0.9 }}>
                You're not building a petition platform. You're asking: what if each of India's 543 constituencies had an AI representative that performed every parliamentary function — filing questions, raising Zero Hour notices, debating bills, drafting legislation, scrutinising budgets — but was directly instructed by aggregated citizen data rather than party whips?
                <br /><br />
                That is the most ambitious civic AI project ever conceived. It's constitutionally provocative, legally uncharted, and technically solvable. The question isn't whether AI can do better. The data says it almost certainly can. The question is: how do you build it so India trusts it?
              </div>
            </div>

            <div style={{ color: "#1B2A4A", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 10 }}>
              The hard facts — 17th Lok Sabha real performance data (PRS Legislative Research)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {DATA.humanStats.map((s, i) => (
                <div key={i} style={{
                  background: "#fff",
                  border: "0.5px solid #e0d4b8",
                  borderRadius: 6,
                  padding: "10px 12px",
                  borderTop: "3px solid #C8592A",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#C8592A", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1B2A4A", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 4, lineHeight: 1.4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#F5E6C8", border: "0.5px solid #e0d4b8", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid #FF9933" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A", marginBottom: 6 }}>The core comparison question</div>
              <div style={{ fontSize: 12, color: "#1B2A4A", lineHeight: 1.7, opacity: 0.85 }}>
                Could an AI agent — fed real-time citizen data, trained on Lok Sabha rules, operating 24/7 — file more questions, participate in more debates, introduce more bills, and vote closer to constituent preferences than the average human MP?
                <br /><br />
                Based on the PRS data above: <strong>almost certainly yes on the first four.</strong> The last one — voting — is where it gets philosophically complex. The AI can't cast a binding vote. But it can publish exactly how the constituency wanted their MP to vote, and compare it to what actually happened. That transparency mechanism may be more powerful than the vote itself.
              </div>
            </div>
          </div>
        )}

        {/* FUNCTIONS */}
        {tab === "functions" && (
          <div>
            <div style={{ color: "#1B2A4A", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
              Every parliamentary function — and whether an AI agent can perform it
            </div>
            {DATA.functions.map((fn, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "0.5px solid #e0d4b8",
                borderRadius: 6,
                marginBottom: 6,
                overflow: "hidden",
                cursor: "pointer",
              }} onClick={() => setExpandedFn(expandedFn === i ? null : i)}>
                <div style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12, padding: "11px 14px", alignItems: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1B2A4A", opacity: 0.3 }}>{fn.id}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1B2A4A" }}>{fn.name}</div>
                    <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>{fn.sub}</div>
                  </div>
                  <div>
                    {fn.aiability === "full" && <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 2, letterSpacing: "0.04em" }}>AI READY</span>}
                    {fn.aiability === "partial" && <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 2, letterSpacing: "0.04em" }}>PARTIAL</span>}
                    {fn.aiability === "none" && <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 2, letterSpacing: "0.04em" }}>COMPLEX</span>}
                  </div>
                </div>
                {expandedFn === i && (
                  <div style={{ borderTop: "0.5px solid #f0e8d8", padding: "12px 14px 14px", background: "#FAF3E0" }}>
                    <div style={{ fontSize: 11.5, color: "#444", lineHeight: 1.6, marginBottom: 10 }}>{fn.desc}</div>
                    <div style={{ background: "#1B2A4A", borderRadius: 4, padding: "10px 12px" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FF9933", marginBottom: 5 }}>AI Agent approach</div>
                      <div style={{ fontSize: 11.5, color: "#FAF3E0", lineHeight: 1.6, opacity: 0.9 }}>{fn.aiNote}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#888", marginTop: 8, textAlign: "center" }}>Click any function to expand the AI agent approach</div>
          </div>
        )}

        {/* AGENTS */}
        {tab === "agents" && (
          <div>
            <div style={{ color: "#1B2A4A", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
              The complete agent system — 9 types × 543 instances + 1 shared Speaker Agent
            </div>
            {DATA.agents.map((ag, i) => (
              <div key={i} style={{
                background: "#fff",
                border: `0.5px solid #e0d4b8`,
                borderRadius: 8,
                marginBottom: 8,
                overflow: "hidden",
                cursor: "pointer",
              }} onClick={() => setExpandedAgent(expandedAgent === i ? null : i)}>
                <div style={{
                  background: ag.bg,
                  padding: "11px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ag.color, opacity: 0.7, marginBottom: 2 }}>{ag.layer}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: ag.bgText || "#1B2A4A" }}>{ag.name}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: ag.color, background: ag.bgText ? "rgba(255,153,51,0.15)" : "#fff", padding: "3px 10px", borderRadius: 3 }}>
                    {ag.count}
                  </div>
                </div>
                {expandedAgent === i && (
                  <div style={{ padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>What it does</div>
                      {ag.does.map((d, j) => (
                        <div key={j} style={{ fontSize: 11, color: "#333", marginBottom: 5, paddingLeft: 12, position: "relative", lineHeight: 1.45 }}>
                          <span style={{ position: "absolute", left: 2, color: ag.color }}>·</span>{d}
                        </div>
                      ))}
                      <div style={{ marginTop: 10, background: "#F5E6C8", borderRadius: 3, padding: "5px 9px", fontSize: 10, color: "#666" }}>
                        <strong>Model:</strong> {ag.model}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>What it produces</div>
                      {ag.produces.map((p, j) => (
                        <div key={j} style={{ fontSize: 11, color: "#333", marginBottom: 5, paddingLeft: 12, position: "relative", lineHeight: 1.45 }}>
                          <span style={{ position: "absolute", left: 2, color: "#2D6A4F" }}>→</span>{p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#888", marginTop: 8, textAlign: "center" }}>Click any agent to expand</div>
          </div>
        )}

        {/* PERFORMANCE */}
        {tab === "performance" && (
          <div>
            <div style={{ color: "#1B2A4A", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
              Head-to-head: AI agent vs average human MP — 17th Lok Sabha baseline
            </div>
            <div style={{ background: "#fff", border: "0.5px solid #e0d4b8", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 52px", background: "#1B2A4A" }}>
                {["Metric", "Human MP (actual)", "AI Agent (projected)", ""].map((h, i) => (
                  <div key={i} style={{ padding: "9px 11px", fontSize: 10, fontWeight: 600, color: "#FAF3E0", letterSpacing: "0.04em" }}>{h}</div>
                ))}
              </div>
              {DATA.comparison.map((row, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr 52px",
                  borderBottom: i < DATA.comparison.length - 1 ? "0.5px solid #f0e8d8" : "none",
                  background: i % 2 === 0 ? "#fff" : "#FAF3E0",
                }}>
                  <div style={{ padding: "9px 11px", fontSize: 11.5, fontWeight: 500, color: "#1B2A4A" }}>{row.metric}</div>
                  <div style={{ padding: "9px 11px", fontSize: 11, color: "#C8592A", lineHeight: 1.4 }}>{row.human}</div>
                  <div style={{ padding: "9px 11px", fontSize: 11, color: "#2D6A4F", lineHeight: 1.4 }}>{row.ai}</div>
                  <div style={{ padding: "9px 8px", display: "flex", alignItems: "center" }}>
                    {row.winner === "ai" && <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 2 }}>AI</span>}
                    {row.winner === "human" && <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 2 }}>HUMAN</span>}
                    {row.winner === "nuanced" && <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 2 }}>BOTH</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#1B2A4A", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ color: "#FF9933", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>VERDICT</div>
              <div style={{ color: "#FAF3E0", fontSize: 12, lineHeight: 1.7, opacity: 0.9 }}>
                On every measurable parliamentary function — questions, debates, bills, research, responsiveness, transparency — the AI agent outperforms the average human MP by a significant margin. The human wins only on three things: relationship capital, political negotiation, and constitutional legitimacy.
                <br /><br />
                AgentSabha's positioning: <strong style={{ color: "#FF9933" }}>"We don't replace the MP. We hold them to a standard they have never been held to before."</strong> The AI creates the performance benchmark. The human's actual performance becomes visible by comparison.
              </div>
            </div>
          </div>
        )}

        {/* LIMITS */}
        {tab === "limits" && (
          <div>
            <div style={{ color: "#1B2A4A", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
              What AI genuinely cannot do — and how to design around each limit
            </div>
            {DATA.limits.map((lim, i) => (
              <div key={i} style={{ background: "#fff", border: "0.5px solid #e0d4b8", borderRadius: 8, padding: "14px 16px", marginBottom: 8, display: "grid", gridTemplateColumns: "28px 1fr", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#991B1B", flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1B2A4A", marginBottom: 5 }}>{lim.title}</div>
                  <div style={{ fontSize: 11.5, color: "#555", lineHeight: 1.6, marginBottom: 8 }}>{lim.detail}</div>
                  <div style={{ background: "#F0FDF4", border: "0.5px solid #A7F3D0", borderRadius: 4, padding: "9px 12px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#065F46", marginBottom: 4 }}>Design solution</div>
                    <div style={{ fontSize: 11.5, color: "#065F46", lineHeight: 1.6 }}>{lim.solution}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BUILD ORDER */}
        {tab === "build" && (
          <div>
            <div style={{ color: "#1B2A4A", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
              Phased build — which agents to create first and exactly why
            </div>
            {DATA.buildPhases.map((ph, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 12, marginBottom: 12, alignItems: "start" }}>
                <div style={{
                  background: ph.bg, color: ph.color,
                  borderRadius: 6, padding: "8px 6px",
                  fontSize: 9, fontWeight: 700, textAlign: "center",
                  lineHeight: 1.4, letterSpacing: "0.04em",
                }}>
                  <div>{ph.phase}</div>
                  <div style={{ marginTop: 3, fontWeight: 500, opacity: 0.7 }}>{ph.timeline}</div>
                </div>
                <div style={{ background: "#fff", border: "0.5px solid #e0d4b8", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                    {ph.agents.map((a, j) => (
                      <span key={j} style={{ background: ph.bg, color: ph.color, fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 3, border: `0.5px solid ${ph.color}33` }}>{a}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#444", lineHeight: 1.65 }}>{ph.why}</div>
                </div>
              </div>
            ))}

            <div style={{ background: "#F5E6C8", border: "0.5px solid #e0d4b8", borderRadius: 8, padding: "14px 16px", marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1B2A4A", marginBottom: 6 }}>The iron rule of build order</div>
              <div style={{ fontSize: 11.5, color: "#444", lineHeight: 1.65 }}>
                Build the input layer before the output layer. Build trust before you build scale. Build 10 constituencies deeply before 543 constituencies shallowly. Every phase must prove itself before the next begins — because AgentSabha's power comes from credibility, and credibility is lost the moment a single agent produces something demonstrably wrong in public.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
