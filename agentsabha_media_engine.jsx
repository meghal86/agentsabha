import { useState } from "react";

const PIPELINE_STEPS = [
  {
    day: "MON–THU",
    label: "Data Accumulates",
    icon: "📥",
    color: "#FF9933",
    agents: ["Intake Agent", "Clustering Agent", "Severity Agent"],
    desc: "Citizens submit issues across 543 constituencies. AI clusters, ranks, and scores every complaint by criticality, velocity, and geographic spread.",
    output: "Weekly issue ledger: top issues per constituency, national pulse, rising trends",
  },
  {
    day: "FRIDAY 00:00",
    label: "Analysis Engine Fires",
    icon: "🧠",
    color: "#C8592A",
    agents: ["Perspective Agent", "Research Agent", "Solution Agent"],
    desc: "Automated pipeline wakes. Takes top 5 national issues. Runs 5-perspective analysis. Fetches global precedents. Builds solution frameworks. No human touches this.",
    output: "5-perspective brief + solution recommendations + data citations for every issue",
  },
  {
    day: "FRIDAY 04:00",
    label: "Podcast Script Generated",
    icon: "🎙️",
    color: "#1D4ED8",
    agents: ["Script Agent", "Fact-Check Agent", "Narrative Agent"],
    desc: "Podcast Script Agent writes a structured 20-25 min episode. Two AI hosts (one asks, one analyses). Transitions, debates, dramatic moments. Fact-check agent verifies every number before it's spoken.",
    output: "Full podcast script with timestamps, speaker cues, data callouts, chapter markers",
  },
  {
    day: "FRIDAY 06:00",
    label: "AI Voices Render",
    icon: "🔊",
    color: "#7C3AED",
    agents: ["Voice Synthesis Agent", "Audio Mix Agent"],
    desc: "ElevenLabs renders two distinct AI voices — one male, one female, both Hindi-accented English. Audio mix agent adds intro/outro music, ambient parliament sounds, chapter transitions.",
    output: "Full rendered MP3 podcast, 20-25 minutes, broadcast quality",
  },
  {
    day: "FRIDAY 08:00",
    label: "Video + Reels Generated",
    icon: "🎬",
    color: "#065F46",
    agents: ["Visual Agent", "Reels Agent", "Thumbnail Agent"],
    desc: "Data visualisations rendered automatically. 4 Instagram Reels cut from podcast highlights — each under 60 seconds. Thumbnail generated. Captions auto-generated in Hindi + English.",
    output: "1 full YouTube video + 4 Instagram Reels + thumbnail + captions in 2 languages",
  },
  {
    day: "FRIDAY 09:00",
    label: "MP Briefs Dispatched",
    icon: "📨",
    color: "#B45309",
    agents: ["MP Brief Agent", "WhatsApp Dispatch Agent"],
    desc: "Each MP receives their constituency-specific brief via WhatsApp. 1-page PDF: top 5 issues, severity scores, citizen quotes, parliamentary action recommendations. 543 personalised briefs sent automatically.",
    output: "543 personalised MP WhatsApp briefs + downloadable PDF dossiers",
  },
  {
    day: "FRIDAY 09:30",
    label: "Press Package Released",
    icon: "📰",
    color: "#2D6A4F",
    agents: ["Press Release Agent", "Data Package Agent", "API Push Agent"],
    desc: "Journalist press package: structured data, story angles, constituency-level breakdowns, embeddable charts. Pushed to registered journalist API keys. Story ready to publish with zero additional research.",
    output: "Press release + structured data JSON + embeddable charts + 5 pre-written story angles",
  },
  {
    day: "FRIDAY 10:00",
    label: "All Channels Go Live",
    icon: "🚀",
    color: "#FF9933",
    agents: ["YouTube Upload Agent", "Instagram Post Agent", "Twitter/X Agent", "LinkedIn Agent"],
    desc: "Simultaneous publish across all platforms. YouTube uploads with chapters, description, tags. Instagram posts 4 reels with Hindi + English captions. Twitter thread with key data. LinkedIn analysis post.",
    output: "Live on YouTube + Instagram + Twitter/X + LinkedIn — zero human action required",
  },
];

const PERSPECTIVES = [
  {
    id: "citizen",
    label: "Citizen Voice",
    icon: "👥",
    color: "#FF9933",
    question: "What are people actually experiencing and saying?",
    sources: ["AgentSabha issue reports", "Citizen quotes (anonymised)", "Severity scores", "Geographic spread", "Repeat complaint patterns"],
    angle: "Raw, unfiltered ground truth. The numbers, the quotes, the pain — reported exactly as citizens submitted them.",
    example: "847 citizens in Varanasi report the same stretch of NH-19. Here are 5 of their voices.",
  },
  {
    id: "ruling",
    label: "Ruling Party View",
    icon: "🏛️",
    color: "#1D4ED8",
    question: "What would the government say in its defence?",
    sources: ["Ministry press releases", "Budget allocation data", "Scheme disbursement records", "Official project timelines", "Parliament answers by ministers"],
    angle: "Presents the government's position with its actual data — projects announced, funds released, timelines stated. Steelmans the best possible government case.",
    example: "Ministry of Road Transport allocated ₹2,300Cr to UP roads in 2024-25. The NH-19 project is in Phase 2 as per official records.",
  },
  {
    id: "opposition",
    label: "Opposition View",
    icon: "⚡",
    color: "#C8592A",
    question: "What would the opposition argue and on what grounds?",
    sources: ["Opposition press conferences", "Parliament debate records", "CAG audit reports", "RTI responses", "State government alternate data"],
    angle: "Presents the strongest opposition arguments using actual parliamentary records and CAG findings — not rhetoric.",
    example: "CAG 2023 report flagged ₹850Cr in unexplained delays on UP road contracts. Opposition has raised this in Parliament 7 times without ministerial response.",
  },
  {
    id: "expert",
    label: "Expert Analysis",
    icon: "🔬",
    color: "#065F46",
    question: "What do domain experts, economists, and policy researchers say?",
    sources: ["PRS Legislative Research", "NITI Aayog reports", "World Bank India studies", "IIM/IIT research", "Think tank publications"],
    angle: "Peer-reviewed, evidence-based policy analysis — what the data actually shows when examined rigorously.",
    example: "Road maintenance spending in India is 3x less than international benchmarks per km. PRS analysis shows this pattern across 18 states.",
  },
  {
    id: "global",
    label: "Global Benchmark",
    icon: "🌍",
    color: "#7C3AED",
    question: "How have other countries solved this exact problem?",
    sources: ["OECD governance data", "World Bank best practices", "Country case studies", "UN governance reports", "International city comparisons"],
    angle: "What Germany, Japan, South Korea, or Brazil did when they faced the same issue — and how long it actually took.",
    example: "Japan's road maintenance model uses IoT sensors + predictive maintenance, reducing repair costs by 40%. South Korea implemented citizen complaint APIs in 2018 — resolution time dropped from 45 days to 11 days.",
  },
  {
    id: "solution",
    label: "AgentSabha Solution",
    icon: "💡",
    color: "#B45309",
    question: "What is the research-backed path to actually fixing this?",
    sources: ["Comparative policy analysis", "Cost-benefit modelling", "Implementation precedents", "Regulatory pathway mapping", "Stakeholder impact assessment"],
    angle: "A specific, costed, precedent-backed recommendation. Not opinion — a structured policy proposal with timelines, responsible parties, and success metrics.",
    example: "Recommendation: Adopt Karnataka's pothole reporting API model (2019) + make contractor payment linked to 90-day durability rating verified by citizen reports. Estimated cost: ₹45Cr/year. Precedent: 6 states have done variants. Expected outcome: 60% complaint reduction in 18 months.",
  },
];

const CONTENT_FORMATS = [
  {
    platform: "YouTube",
    format: "Weekly AI Podcast",
    icon: "▶️",
    duration: "20–25 min",
    frequency: "Every Friday 10am",
    revenue: "₹2–15L/month",
    revenueType: "Ad revenue + sponsorship",
    color: "#C8592A",
    audience: "Urban educated, journalists, students, researchers",
    structure: [
      "00:00 — India Pulse intro (2 min): top 3 numbers from the week",
      "02:00 — Issue Deep Dive #1: all 6 perspectives (8 min)",
      "10:00 — Issue Deep Dive #2: all 6 perspectives (8 min)",
      "18:00 — AgentSabha Solution Brief (4 min)",
      "22:00 — Next week preview + call to submit issues (2 min)",
    ],
    automation: "Script → ElevenLabs voices → Runway/HeyGen visuals → auto-upload with chapters + SEO",
  },
  {
    platform: "Instagram Reels",
    format: "4 Reels/week",
    icon: "📱",
    duration: "30–60 sec each",
    frequency: "Fri / Sat / Sun / Mon",
    revenue: "₹50K–5L/month",
    revenueType: "Creator fund + brand deals",
    color: "#7C3AED",
    audience: "18–35, mobile-first, Hindi & English",
    structure: [
      "Reel 1 (Fri): 'This week in India' — 3 shocking numbers",
      "Reel 2 (Sat): Deep issue explainer — 1 issue, 60 sec",
      "Reel 3 (Sun): 'What the government says vs reality' — ruling vs opposition",
      "Reel 4 (Mon): Solution spotlight — how another country fixed it",
    ],
    automation: "Podcast highlights → auto-clip + captions → auto-post at peak engagement times",
  },
  {
    platform: "WhatsApp",
    format: "MP Weekly Brief",
    icon: "📨",
    duration: "1-page PDF + voice note",
    frequency: "Every Friday 9am",
    revenue: "₹50K/month/MP (subscription)",
    revenueType: "B2B subscription product",
    color: "#2D6A4F",
    audience: "543 MPs + their staff offices",
    structure: [
      "Top 5 constituency issues this week with severity scores",
      "1 Tatkal alert if threshold crossed (highlighted in red)",
      "Suggested parliamentary question for next session",
      "Comparison: your constituency vs national avg on same issues",
      "1 AI-drafted Zero Hour notice ready to file",
    ],
    automation: "Constituency data → personalised brief template → PDF render → WhatsApp Business API send",
  },
  {
    platform: "Journalist API",
    format: "Press Package",
    icon: "📰",
    duration: "Structured data + story angles",
    frequency: "Every Friday 9:30am",
    revenue: "₹2–10L/month/publication",
    revenueType: "API subscription + data license",
    color: "#B45309",
    audience: "The Wire, Scroll, Hindu, Hindustan Times, NDTV, Reuters",
    structure: [
      "5 pre-written story angles with full data backing",
      "Constituency-level data breakdowns for any state",
      "Embeddable charts ready to publish (no design work needed)",
      "Quote library: anonymised citizen voices categorised by issue type",
      "Parliamentary record links: which MPs asked what about this issue",
    ],
    automation: "Weekly data → story angle generation → chart rendering → API push to registered journalists",
  },
  {
    platform: "Twitter / X",
    format: "Data Thread",
    icon: "𝕏",
    duration: "10–15 tweet thread",
    frequency: "Every Friday 10am (with podcast)",
    revenue: "₹20–200K/month",
    revenueType: "Creator monetisation + influence",
    color: "#1B2A4A",
    audience: "Policy community, journalists, political analysts, students",
    structure: [
      "Tweet 1: 'This week AgentSabha's 543 agents processed X issues across India'",
      "Tweets 2–5: Top issue with data, chart, and 6-perspective summary",
      "Tweets 6–9: The solution — what could actually fix it",
      "Tweet 10: Link to full podcast, MP brief signup, journalist API",
    ],
    automation: "Podcast script → thread extraction → auto-post with charts",
  },
];

const NO_HUMAN_AGENTS = [
  {
    name: "Perspective Research Agent",
    icon: "🔍",
    trigger: "Every Friday 00:00, auto",
    does: "For each top issue: fetches government press releases, CAG reports, opposition statements, PRS briefs, OECD comparisons. Builds the 6-perspective brief autonomously.",
    tools: "Web search API + PRS API + CAG database + Parliament Q&A archive + World Bank API",
    output: "6-perspective structured brief per issue, all claims with source citations",
    challenge: "Bias detection — agent must flag when government data and CAG data conflict. Shows both.",
  },
  {
    name: "Script Writer Agent",
    icon: "✍️",
    trigger: "Auto after Perspective Agent completes",
    does: "Writes full 20-25 min podcast script. Two hosts: 'Priya' (questioner, represents citizen voice) and 'Arjun' (analyst, presents data). Natural Hindi-English Hinglish conversation, not robotic reading.",
    tools: "Claude Sonnet with podcast writing system prompt + structured brief input",
    output: "Full script with speaker tags, timestamps, emphasis markers, data callouts",
    challenge: "Must sound like a genuine conversation — not a report being read aloud. Hosts disagree sometimes. Priya challenges Arjun's analysis.",
  },
  {
    name: "Fact Check Agent",
    icon: "✅",
    trigger: "Auto after Script Agent — blocks publishing until cleared",
    does: "Verifies every statistic, date, name, and claim in the script against original sources. Flags unverified claims. Either finds a source or removes the claim. Hard gate — script cannot proceed if unverified claims remain.",
    tools: "Source database + web search + structured citation matching",
    output: "Verified script with every claim linked to source. Fact-check report stored.",
    challenge: "The most important agent in the pipeline. Gets this wrong once = credibility destroyed permanently.",
  },
  {
    name: "Voice Synthesis Agent",
    icon: "🔊",
    trigger: "Auto after Fact Check clears",
    does: "Renders two distinct voice profiles via ElevenLabs. Priya: female, 30s, Hindi-accented English, measured pace. Arjun: male, 40s, slightly more formal, data-confident. Adjusts pacing for dramatic moments.",
    tools: "ElevenLabs API with custom voice profiles for both hosts",
    output: "Full rendered dual-voice audio file, 20-25 min, broadcast quality MP3",
    challenge: "Hinglish pronunciation — Hindi words within English sentences. Requires careful phonetic markup in script.",
  },
  {
    name: "Data Visualisation Agent",
    icon: "📊",
    trigger: "Parallel to Voice Synthesis",
    does: "Converts issue data into charts, maps, infographics. Uses constituency map with heat overlay. Timeline charts for velocity. Bar charts for severity comparison. All in AgentSabha visual identity — Neela, Kesariya, Haldi.",
    tools: "D3.js renderer + constituency TopoJSON + automated chart templates",
    output: "10–15 publication-ready data visualisations per episode",
    challenge: "Charts must be readable at both desktop (YouTube) and mobile (Instagram) resolution automatically.",
  },
  {
    name: "Video Assembly Agent",
    icon: "🎬",
    trigger: "Auto after audio + visuals ready",
    does: "Assembles full YouTube video: AI host avatars (optional HeyGen) or kinetic typography + data viz over audio. Adds chapters, intro, outro, lower thirds with data. Renders final MP4.",
    tools: "FFmpeg + HeyGen API or Runway ML + chapter marker injection",
    output: "YouTube-ready MP4 with chapters, or audio-only with visualiser waveform",
    challenge: "AI avatar lip-sync with Hinglish is imperfect. May be better to start with data viz + voice before adding avatars.",
  },
  {
    name: "Reels Cutter Agent",
    icon: "✂️",
    trigger: "Auto after video assembly",
    does: "Identifies the 4 highest-impact 30–60 second moments from the podcast. Cuts, adds captions in Hindi + English, formats for 9:16 vertical. Adds hook text on first frame. Adds AgentSabha branding.",
    tools: "Whisper for transcript → GPT-4o for moment selection → FFmpeg for cutting + formatting",
    output: "4 vertical Reels with captions, branding, ready to post",
    challenge: "Hook identification — which moment makes someone stop scrolling? Agent must score moments by shareability.",
  },
  {
    name: "Distribution Agent",
    icon: "🚀",
    trigger: "Friday 10:00am — simultaneous across all platforms",
    does: "Uploads YouTube video with SEO-optimised title, description, tags, chapters. Posts 4 Reels with captions. Sends Twitter thread. Pushes press package to journalist API endpoints. Sends 543 WhatsApp MP briefs.",
    tools: "YouTube API + Instagram Graph API + Twitter API + WhatsApp Business API + custom journalist webhook",
    output: "All content live across all platforms. Delivery confirmation logged.",
    challenge: "Platform API rate limits — YouTube upload can take 30–60 min to process. Must queue and monitor.",
  },
];

const UNBIASED_PRINCIPLES = [
  { principle: "No editorial position", detail: "AgentSabha never says 'the government is corrupt' or 'the opposition is obstructing.' It presents what each side's actual data says and lets the listener decide." },
  { principle: "Steelman every view", detail: "Every perspective — including the ruling party — gets the strongest possible argument made on its behalf, sourced from its own records and statements. No strawmanning." },
  { principle: "Conflict surfacing, not resolution", detail: "When government data contradicts CAG data, both are shown side by side with the discrepancy clearly labelled. The agent does not resolve the contradiction — it makes it visible." },
  { principle: "Solutions are policy, not politics", detail: "The solution perspective is based on: what has worked elsewhere, what the evidence says, what the cost-benefit analysis shows. It never attributes blame or credit to any party." },
  { principle: "Citizens from every demographic", detail: "Issue selection is weighted to represent rural/urban, north/south/east/west, all income groups. No constituency cluster dominates the weekly episode without acknowledgment." },
  { principle: "All parties, all states", detail: "Weekly issue selection rotates across BJP-governed states, Congress-governed states, regional party-governed states. No political geography is systematically overrepresented." },
];

export default function MediaEngine() {
  const [tab, setTab] = useState("pipeline");
  const [activePerspective, setActivePerspective] = useState("citizen");
  const [activeFormat, setActiveFormat] = useState(0);
  const [activeAgent, setActiveAgent] = useState(null);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0F1923", minHeight: "100vh", color: "#FAF3E0" }}>

      {/* Header */}
      <div style={{ background: "#0A1015", borderBottom: "1px solid #1e2d3d", padding: "12px 20px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div>
            <span style={{ color: "#FF9933", fontWeight: 700, fontSize: 15 }}>AgentSabha</span>
            <span style={{ color: "#FAF3E0", opacity: 0.3, margin: "0 8px" }}>·</span>
            <span style={{ color: "#FAF3E0", opacity: 0.5, fontSize: 11 }}>Autonomous Media Engine — Zero Humans in Loop</span>
          </div>
          <div style={{ marginLeft: "auto", background: "#2D6A4F22", border: "0.5px solid #2D6A4F", borderRadius: 3, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#2D6A4F", letterSpacing: "0.05em" }}>
            FULLY AUTOMATED
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
          {[
            { id: "pipeline", label: "Weekly Pipeline" },
            { id: "perspectives", label: "6-Perspective Engine" },
            { id: "formats", label: "Content Formats" },
            { id: "agents", label: "No-Human Agents" },
            { id: "unbiased", label: "Unbiased Design" },
            { id: "revenue", label: "Media Revenue" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "#FAF3E0" : "transparent",
              color: tab === t.id ? "#0F1923" : "#FAF3E0",
              border: "none", padding: "7px 13px", fontSize: 10, fontWeight: 600,
              cursor: "pointer", borderRadius: "3px 3px 0 0",
              opacity: tab === t.id ? 1 : 0.55, whiteSpace: "nowrap",
              letterSpacing: "0.03em",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: 820, margin: "0 auto" }}>

        {/* PIPELINE */}
        {tab === "pipeline" && (
          <div>
            <div style={{ background: "#111d2a", borderRadius: 8, padding: "14px 16px", marginBottom: 20, borderLeft: "3px solid #FF9933" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#FF9933", marginBottom: 6 }}>The concept: India's first fully autonomous civic media machine</div>
              <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.75, lineHeight: 1.7 }}>
                Every week, 543 AI agents collect India's civic pain. Every Friday, a pipeline fires with zero human involvement — and by 10am, a podcast is live on YouTube, 4 reels are posted on Instagram, 543 MPs have their briefings, and journalists have their data packages. AgentSabha becomes the most credible, most consistent, and most unbiased civic voice in India. And nobody had to lift a finger.
              </div>
            </div>

            <div style={{ position: "relative" }}>
              {PIPELINE_STEPS.map((step, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 16, marginBottom: 4 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ background: step.color, borderRadius: 6, padding: "5px 8px", fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textAlign: "center", color: "#fff", width: "100%", marginBottom: 4, lineHeight: 1.3 }}>
                      {step.day}
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div style={{ width: 1.5, flex: 1, background: "#1e2d3d", minHeight: 20 }} />
                    )}
                  </div>
                  <div style={{ background: "#111d2a", borderRadius: 8, padding: "12px 14px", marginBottom: 8, border: `0.5px solid ${step.color}22` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{step.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: step.color }}>{step.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.65, lineHeight: 1.6, marginBottom: 8 }}>{step.desc}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
                      {step.agents.map((a, j) => (
                        <span key={j} style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 2, background: `${step.color}22`, color: step.color, border: `0.5px solid ${step.color}44`, letterSpacing: "0.03em" }}>{a}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: "#2D6A4F", fontStyle: "italic" }}>→ {step.output}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#FF993311", border: "1px solid #FF993344", borderRadius: 8, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FF9933", marginBottom: 4 }}>The no-human guarantee</div>
              <div style={{ fontSize: 11.5, color: "#FAF3E0", opacity: 0.8, lineHeight: 1.6 }}>
                From Monday's first citizen submission to Friday 10am's YouTube upload — the only trigger is a cron job. No editor approves the script. No producer reviews the audio. No community manager schedules the posts. The system either publishes or it flags itself as broken and sends an alert. Human oversight happens at the system level, never the content level.
              </div>
            </div>
          </div>
        )}

        {/* PERSPECTIVES */}
        {tab === "perspectives" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF9933", opacity: 0.6, marginBottom: 4 }}>The core editorial framework</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#FAF3E0", marginBottom: 8 }}>Every issue. Every perspective. Every week.</div>
              <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.6, lineHeight: 1.65 }}>
                For every top issue, AgentSabha runs 6 autonomous research threads simultaneously. Each agent searches different source databases. The result: a balanced analysis that no single journalist, party, or institution can challenge as biased — because it represents them all.
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {PERSPECTIVES.map(p => (
                <button key={p.id} onClick={() => setActivePerspective(p.id)} style={{
                  background: activePerspective === p.id ? p.color : "#111d2a",
                  color: activePerspective === p.id ? "#fff" : "#FAF3E0",
                  border: `0.5px solid ${activePerspective === p.id ? p.color : "#2a3a4a"}`,
                  padding: "7px 14px", fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>

            {PERSPECTIVES.filter(p => p.id === activePerspective).map(p => (
              <div key={p.id} style={{ background: "#111d2a", borderRadius: 10, overflow: "hidden", border: `0.5px solid ${p.color}44` }}>
                <div style={{ background: p.color, padding: "14px 16px" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: "#fff", opacity: 0.85, fontStyle: "italic" }}>"{p.question}"</div>
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: p.color, marginBottom: 8 }}>Data sources the agent searches</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {p.sources.map((s, i) => (
                        <span key={i} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 3, background: `${p.color}15`, color: p.color, border: `0.5px solid ${p.color}33` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FAF3E0", opacity: 0.4, marginBottom: 6 }}>Editorial angle</div>
                    <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.8, lineHeight: 1.6 }}>{p.angle}</div>
                  </div>
                  <div style={{ background: "#0d1822", borderRadius: 6, padding: "12px 14px", borderLeft: `3px solid ${p.color}` }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: p.color, marginBottom: 5 }}>Example output — Varanasi road issue</div>
                    <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.8, lineHeight: 1.6, fontStyle: "italic" }}>"{p.example}"</div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 16, background: "#111d2a", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#FF9933", marginBottom: 8 }}>Why this is more powerful than any journalist or political analyst</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "No journalist does this", val: "A journalist either has access to government or opposition — rarely both, never all 6 simultaneously in one piece." },
                  { label: "No party can dismiss it", val: "The ruling party is steelmanned. The opposition is steelmanned. Neither can claim bias — their own words and data are used." },
                  { label: "No think tank has this data", val: "The citizen voice is real, live, this week — not a survey from 6 months ago. That's the differentiator no institution can replicate." },
                  { label: "The solution is actionable", val: "Not 'the government should do better' — a specific, costed, precedent-backed recommendation with global evidence." },
                ].map((item, i) => (
                  <div key={i} style={{ borderTop: "1px solid #1e2d3d", paddingTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#FF9933", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.6, lineHeight: 1.5 }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FORMATS */}
        {tab === "formats" && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {CONTENT_FORMATS.map((f, i) => (
                <button key={i} onClick={() => setActiveFormat(i)} style={{
                  background: activeFormat === i ? f.color : "#111d2a",
                  color: "#FAF3E0", border: `0.5px solid ${activeFormat === i ? f.color : "#2a3a4a"}`,
                  padding: "7px 13px", fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>{f.icon}</span> {f.platform}
                </button>
              ))}
            </div>

            {(() => {
              const f = CONTENT_FORMATS[activeFormat];
              return (
                <div style={{ background: "#111d2a", borderRadius: 10, overflow: "hidden", border: `0.5px solid ${f.color}44` }}>
                  <div style={{ background: f.color, padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr auto" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#fff", opacity: 0.75, marginBottom: 3 }}>{f.icon} {f.platform}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.format}</div>
                      <div style={{ fontSize: 11, color: "#fff", opacity: 0.8, marginTop: 4 }}>{f.frequency} · {f.duration}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "#fff", opacity: 0.6, marginBottom: 2 }}>Revenue potential</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{f.revenue}</div>
                      <div style={{ fontSize: 10, color: "#fff", opacity: 0.7 }}>{f.revenueType}</div>
                    </div>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#FAF3E0", opacity: 0.4, marginBottom: 8 }}>Target audience</div>
                      <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.7 }}>{f.audience}</div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#FAF3E0", opacity: 0.4, marginBottom: 8 }}>Episode / post structure</div>
                      {f.structure.map((s, i) => (
                        <div key={i} style={{ fontSize: 11.5, color: "#FAF3E0", opacity: 0.7, marginBottom: 5, paddingLeft: 14, position: "relative", lineHeight: 1.5 }}>
                          <span style={{ position: "absolute", left: 2, color: f.color }}>→</span>{s}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#0d1822", borderRadius: 6, padding: "12px 14px", borderLeft: `3px solid ${f.color}` }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: f.color, marginBottom: 5 }}>Automation stack</div>
                      <div style={{ fontSize: 11.5, color: "#FAF3E0", opacity: 0.75, lineHeight: 1.6 }}>{f.automation}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* NO HUMAN AGENTS */}
        {tab === "agents" && (
          <div>
            <div style={{ background: "#2D6A4F22", border: "0.5px solid #2D6A4F66", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2D6A4F", marginBottom: 4 }}>Zero humans. Full autonomy. One cron job.</div>
              <div style={{ fontSize: 11.5, color: "#FAF3E0", opacity: 0.7, lineHeight: 1.6 }}>
                The entire pipeline from data collection to publishing is orchestrated by agents. The only human role is: build the system, monitor the system health dashboard, and review the automated quality report once a week. Content production is entirely machine-driven.
              </div>
            </div>

            {NO_HUMAN_AGENTS.map((ag, i) => (
              <div key={i} onClick={() => setActiveAgent(activeAgent === i ? null : i)} style={{
                background: "#111d2a", borderRadius: 8, marginBottom: 8, overflow: "hidden",
                border: `0.5px solid ${activeAgent === i ? "#FF9933" : "#1e2d3d"}`, cursor: "pointer",
              }}>
                <div style={{ padding: "11px 14px", display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>{ag.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FAF3E0" }}>{ag.name}</div>
                    <div style={{ fontSize: 10, color: "#FAF3E0", opacity: 0.4, marginTop: 1 }}>{ag.trigger}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#FF9933", opacity: 0.6 }}>{activeAgent === i ? "▲" : "▼"}</div>
                </div>
                {activeAgent === i && (
                  <div style={{ padding: "0 14px 14px", borderTop: "0.5px solid #1e2d3d" }}>
                    <div style={{ paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FF9933", opacity: 0.6, marginBottom: 5 }}>What it does</div>
                        <div style={{ fontSize: 11.5, color: "#FAF3E0", opacity: 0.7, lineHeight: 1.6, marginBottom: 10 }}>{ag.does}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#2D6A4F", opacity: 0.7, marginBottom: 5 }}>Tools / APIs</div>
                        <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.6, lineHeight: 1.5 }}>{ag.tools}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1D4ED8", opacity: 0.7, marginBottom: 5 }}>Output</div>
                        <div style={{ fontSize: 11.5, color: "#FAF3E0", opacity: 0.7, lineHeight: 1.6, marginBottom: 10 }}>{ag.output}</div>
                        <div style={{ background: "#C8592A22", border: "0.5px solid #C8592A44", borderRadius: 5, padding: "9px 11px" }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#C8592A", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hard challenge</div>
                          <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.7, lineHeight: 1.5 }}>{ag.challenge}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* UNBIASED */}
        {tab === "unbiased" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF9933", opacity: 0.6, marginBottom: 4 }}>Design principles</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#FAF3E0", marginBottom: 8 }}>Represent India. Every perspective. No exceptions.</div>
              <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.6, lineHeight: 1.65 }}>
                The moment AgentSabha is perceived as biased — toward any party, any state, any religion, any demographic — the entire project is over. This isn't just ethics. It's a business survival constraint. These are the architectural rules that make bias structurally impossible.
              </div>
            </div>

            {UNBIASED_PRINCIPLES.map((p, i) => (
              <div key={i} style={{ background: "#111d2a", borderRadius: 8, padding: "13px 15px", marginBottom: 8, display: "grid", gridTemplateColumns: "22px 1fr", gap: 12, alignItems: "start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#FF993322", border: "1px solid #FF993355", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#FF9933", flexShrink: 0 }}>{i+1}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#FAF3E0", marginBottom: 4 }}>{p.principle}</div>
                  <div style={{ fontSize: 11.5, color: "#FAF3E0", opacity: 0.6, lineHeight: 1.55 }}>{p.detail}</div>
                </div>
              </div>
            ))}

            <div style={{ background: "#111d2a", borderRadius: 8, padding: "14px 16px", marginTop: 8, border: "0.5px solid #FF993333" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FF9933", marginBottom: 10 }}>The unbiased audit — published weekly</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Geographic balance report", val: "Which states dominated this week's issues and why" },
                  { label: "Party representation log", val: "How many issues were in BJP vs non-BJP vs AAP governed regions" },
                  { label: "Source citation index", val: "Every claim in every episode linked to primary source, publicly auditable" },
                  { label: "Fact-check confidence score", val: "What % of claims were verified vs flagged vs removed before publishing" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "#0d1822", borderRadius: 5, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#FF9933", marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.55, lineHeight: 1.4 }}>{item.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "#FAF3E0", opacity: 0.55, lineHeight: 1.6, fontStyle: "italic" }}>
                Publishing the audit report makes bias challenges impossible to sustain. If a political party claims AgentSabha is biased, the response is: "Here is the source log for every claim we made about your government. Here is the balance report. Challenge any specific fact."
              </div>
            </div>
          </div>
        )}

        {/* REVENUE */}
        {tab === "revenue" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF9933", opacity: 0.6, marginBottom: 4 }}>Media revenue streams</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#FAF3E0", marginBottom: 8 }}>The media engine earns while it informs</div>
            </div>

            {[
              {
                stream: "YouTube Ad Revenue",
                year1: "₹50K–2L/month", year3: "₹5–20L/month", color: "#C8592A",
                unlock: "Needs 1,000 subscribers + 4,000 watch hours to monetise. Achievable in 3 months with quality civic content.",
                upside: "Civic/political content has 3–5x higher CPM than entertainment. Election months spike 10x.",
              },
              {
                stream: "YouTube Brand Sponsorships",
                year1: "₹0 (build audience first)", year3: "₹5–30L/month", color: "#7C3AED",
                unlock: "At 100K+ subscribers, approach: HDFC, Tata Trusts, Ashoka University, Omidyar Network. Mission-aligned sponsors who benefit from civic credibility.",
                upside: "A single 6-month brand partnership with a major bank or FMCG for 'India Civic Intelligence' = ₹50–100L deal.",
              },
              {
                stream: "Instagram Creator Fund + Brand Deals",
                year1: "₹20K–1L/month", year3: "₹2–10L/month", color: "#1D4ED8",
                unlock: "Instagram data journalism accounts with civic focus grow fast. 50K followers in 6 months is realistic with consistent weekly Reels.",
                upside: "NGO and CSR brand deals — UNICEF India, Aga Khan Foundation, Azim Premji Foundation all spend on civic creator partnerships.",
              },
              {
                stream: "MP Intelligence Subscription",
                year1: "₹50K/month × 20 MPs = ₹10L/month", year3: "₹50K × 200 MPs = ₹1Cr/month", color: "#2D6A4F",
                unlock: "Every MP who subscribes gets a personalised weekly brief + AI-drafted parliamentary questions. The ROI for them is obvious: appear informed in Parliament without doing the research.",
                upside: "If even 100 of 543 MPs subscribe at ₹50K/month = ₹6Cr/year from day 1 of launch.",
              },
              {
                stream: "Journalist API Subscription",
                year1: "₹2L × 5 publications = ₹10L/month", year3: "₹5L × 20 publications = ₹1Cr/month", color: "#B45309",
                unlock: "Approach The Hindu, Scroll, The Wire, Hindustan Times with a press data package. First 3 months free for top 5 publications to build dependency.",
                upside: "International media — BBC India, Reuters, Bloomberg Quint — pay ₹10–25L/year for structured data APIs. One international deal = breakthrough.",
              },
              {
                stream: "Election Intelligence (periodic)",
                year1: "₹0 (building data)", year3: "₹5–50Cr per Lok Sabha cycle", color: "#FF9933",
                unlock: "Sell constituency mood data to political parties 90 days before election. Issue velocity → swing constituency predictor. No polling company has this resolution.",
                upside: "BJP, Congress, AAP, regional parties all spend ₹500Cr+ on elections. Intelligence that costs ₹1–5Cr is a rounding error. This is the single largest revenue event in the entire business.",
              },
            ].map((item, i) => (
              <div key={i} style={{ background: "#111d2a", borderRadius: 8, padding: "13px 15px", marginBottom: 8, borderLeft: `3px solid ${item.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#FAF3E0" }}>{item.stream}</div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                    <div style={{ fontSize: 9, color: "#FAF3E0", opacity: 0.4, marginBottom: 1 }}>Year 1 → Year 3</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: item.color }}>{item.year1} → {item.year3}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.6, lineHeight: 1.5, marginBottom: 7 }}>{item.unlock}</div>
                <div style={{ fontSize: 10.5, color: item.color, opacity: 0.9, fontStyle: "italic", lineHeight: 1.5 }}>↑ {item.upside}</div>
              </div>
            ))}

            <div style={{ background: "#0A1015", borderRadius: 8, padding: "14px 16px", marginTop: 8, border: "0.5px solid #FF993333" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Year 1 media revenue", value: "₹2–3Cr/year", sub: "MP subscriptions + YouTube + 3 journalist APIs" },
                  { label: "Year 3 media revenue", value: "₹15–25Cr/year", sub: "Scale + election cycle + international media" },
                  { label: "Year 5 media revenue", value: "₹50–100Cr+/year", sub: "Platform dominance + every election cycle" },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FAF3E0", opacity: 0.4, marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#FF9933", marginBottom: 4 }}>{item.value}</div>
                    <div style={{ fontSize: 10, color: "#FAF3E0", opacity: 0.5, lineHeight: 1.4 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
