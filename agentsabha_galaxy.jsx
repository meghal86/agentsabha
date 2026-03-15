import { useState } from "react";

const VERTICALS = [
  {
    id: "civic",
    label: "Civic Layer",
    sublabel: "The foundation — already designed",
    color: "#FF9933",
    bg: "#1B2A4A",
    textColor: "#FAF3E0",
    revenue: "₹0 — free public infrastructure",
    revenueColor: "#FF9933",
    tam: "Trust & data flywheel",
    why: "Free civic layer creates the Aadhaar-verified constituency data that every other vertical monetises. Without this layer, there is nothing to sell.",
    agents: [
      { name: "Intake Agent", desc: "Receives issues via WhatsApp, web, IVRS, voice", icon: "📥" },
      { name: "Clustering Agent", desc: "Groups complaints into systemic patterns every 15 min", icon: "🔬" },
      { name: "Question Hour Agent", desc: "Files 2,500+ parliamentary questions per term", icon: "❓" },
      { name: "Zero Hour Agent", desc: "Real-time urgency notices to Parliament", icon: "⚡" },
      { name: "Debate Agent", desc: "Citizens' voice in every legislative debate", icon: "🏛️" },
      { name: "Dissent Agent", desc: "Citizen override on any AI position", icon: "✋" },
    ],
  },
  {
    id: "welfare",
    label: "Citizen Welfare",
    sublabel: "Direct citizen value — builds trust & depth",
    color: "#2D6A4F",
    bg: "#F0FDF4",
    textColor: "#1B2A4A",
    revenue: "₹2–10Cr/year",
    revenueColor: "#2D6A4F",
    tam: "500M+ citizens eligible for schemes they don't claim",
    why: "India has 500+ central and state welfare schemes. Estimated ₹1.5 lakh crore in unclaimed entitlements annually because citizens don't know they qualify. AgentSabha sits on the citizen profile data to fix this.",
    agents: [
      {
        name: "Scheme Eligibility Agent",
        icon: "🎯",
        desc: "Matches citizen's profile + issue type to 500+ govt schemes (PM-Kisan, PMAY, Ayushman Bharat, MGNREGA). Auto-generates application.",
        revenue: "₹50–200/successful claim referral from govt partnership; or ₹99/month premium tier",
        signal: "Already has: age, location, income proxy from issue type, family size from IVRS",
        scale: "If 10M claims processed at ₹100 avg = ₹100Cr/year",
      },
      {
        name: "RTI Filing Agent",
        icon: "📜",
        desc: "Auto-drafts Right to Information applications based on issue type. Citizen's road complaint → RTI to PWD. Water issue → RTI to Jal Board. Files and tracks.",
        revenue: "₹49/RTI filed via platform; ₹299/month RTI tracking subscription",
        signal: "Every civic issue is a potential RTI. 6M RTIs filed annually in India — maybe 10x more warranted.",
        scale: "1% of citizen submissions convert to RTIs at ₹49 = meaningful at scale",
      },
      {
        name: "Legal Aid Agent",
        icon: "⚖️",
        desc: "Drafts consumer complaints, RERA complaints, FIR templates, consumer forum applications. Citizens with electricity billing fraud, builder defaults, police inaction.",
        revenue: "₹99–499/draft. Partner referral fee with legal firms for complex cases.",
        signal: "Consumer complaints, builder issues, police inaction all appear in issue clusters",
        scale: "India has 800M+ consumers with zero legal recourse infrastructure",
      },
      {
        name: "Grievance Status Agent",
        icon: "🔍",
        desc: "Tracks citizen complaint across CPGrams, state portals, ministry systems. Single interface for all outstanding government grievances. Sends status alerts.",
        revenue: "₹29/month subscription. Premium tier: ₹99/month with escalation assistance.",
        signal: "The follow-up problem is as big as the submission problem",
        scale: "CPGrams alone has 20M complaints/year with poor follow-through",
      },
      {
        name: "NGO Routing Agent",
        icon: "🤝",
        desc: "When an issue exceeds government response time threshold, routes citizen to the most relevant NGO operating in their area. Health → CRY/ASHA. Rights → PUCL.",
        revenue: "₹500–2000/verified referral from NGO partners; NGO subscription for routing priority",
        signal: "5,000+ registered NGOs in India with no efficient citizen-NGO matching layer",
        scale: "B2B NGO SaaS: ₹1–5L/year per major NGO for constituency targeting",
      },
    ],
  },
  {
    id: "government",
    label: "Government Intelligence",
    sublabel: "B2G — the biggest contracts",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    textColor: "#1B2A4A",
    revenue: "₹10–100Cr/year",
    revenueColor: "#1D4ED8",
    tam: "₹3,000Cr+ India GovTech market growing 25% YoY",
    why: "State governments spend billions on surveys and consultants to understand ground reality. AgentSabha has real-time, continuous, Aadhaar-verified ground truth for every constituency. That is a dataset they cannot build themselves.",
    agents: [
      {
        name: "Urban Planning Intelligence Agent",
        icon: "🏙️",
        desc: "Infrastructure complaint density → city masterplan intelligence. Where roads fail → where investment is needed. Waterlogging patterns → drainage prioritisation. Feeds directly into Smart City Mission planning.",
        revenue: "₹1–5Cr/year per state government. Central MoUD contract possible.",
        signal: "Complaint geographic clustering gives precise infrastructure stress mapping at ward level",
        scale: "28 states × ₹2Cr = ₹56Cr baseline. Municipal corporations add another layer.",
      },
      {
        name: "Health Surveillance Agent",
        icon: "🏥",
        desc: "Clusters PHC absence complaints + disease symptoms + water quality reports = early disease outbreak signal. Faster than ICMR sentinel surveillance. COVID-type early warning for state health departments.",
        revenue: "₹2–10Cr/year state health department contract. National health mission integration.",
        signal: "PHC complaints, water contamination, unexplained illness all appear in issue clusters",
        scale: "NRHM budget is ₹37,000Cr/year. Intelligence layer is a rounding error to them.",
      },
      {
        name: "Disaster Early Warning Agent",
        icon: "🌊",
        desc: "Infrastructure stress pattern recognition before disaster. Bridge approach road complaints → structural risk. Drainage overflow → flood risk zone. Gives NDMA 48-72hr predictive advantage over reactive response.",
        revenue: "₹5–20Cr/year NDMA / SDMA contract. World Bank disaster resilience funding possible.",
        signal: "Most disasters are preceded by ignored maintenance complaints — the data trail is already there",
        scale: "India spends ₹15,000Cr/year on disaster response. Prevention intelligence is 100x ROI.",
      },
      {
        name: "Agricultural Intelligence Agent",
        icon: "🌾",
        desc: "Farmer complaints about water scarcity, mandi prices, input costs, weather damage → fed to state agriculture departments, FCI, NABARD. Real-time kharif/rabi stress mapping by constituency.",
        revenue: "₹3–15Cr/year state agri department. NABARD / FCI data partnership.",
        signal: "Agricultural issues make up 30%+ of rural constituency complaints in most states",
        scale: "India's agricultural budget: ₹1.25 lakh crore. Intelligence for 1% of that budget = ₹1,250Cr TAM",
      },
      {
        name: "Vidhan Sabha Agent Layer",
        icon: "🏛️",
        desc: "License the entire AgentSabha system to state legislative assemblies — one agent per Vidhan Sabha constituency. 4,033 MLAs across India each with their own AI representative. State-level parliament intelligence.",
        revenue: "₹5–15Cr/year per state. 28 states = ₹140–420Cr potential.",
        signal: "Every state has the same representation bandwidth crisis as Parliament",
        scale: "The highest-margin product in the portfolio. Pure platform licensing.",
      },
    ],
  },
  {
    id: "corporate",
    label: "Corporate Intelligence",
    sublabel: "B2B — recurring SaaS revenue",
    color: "#7C3AED",
    bg: "#F5F3FF",
    textColor: "#1B2A4A",
    revenue: "₹5–50Cr/year",
    revenueColor: "#7C3AED",
    tam: "India B2B intelligence market: $2B+",
    why: "Any company operating in India needs to understand ground-level constituency conditions. No commercial data provider has what AgentSabha has: real-time, Aadhaar-verified, issue-level intelligence per constituency.",
    agents: [
      {
        name: "Market Entry Intelligence Agent",
        icon: "📊",
        desc: "Company wants to expand to Tier 2/3 cities? Infrastructure gap density + complaint patterns reveal exactly which constituencies are infrastructure-ready vs high-risk. Identifies first-mover opportunities.",
        revenue: "₹5–25L/year per corporate subscriber. One-time market entry reports: ₹5–50L.",
        signal: "Road quality, power reliability, water access — exactly what a retail/FMCG expansion team needs",
        scale: "500+ multinationals and 5,000+ domestic companies doing India expansion annually",
      },
      {
        name: "Supply Chain Risk Agent",
        icon: "🚛",
        desc: "Monitors infrastructure complaint spikes along major supply corridors. NH-44, NH-48 road damage clusters → logistics risk alerts. Power cut severity in industrial areas → manufacturing disruption signal.",
        revenue: "₹10–50L/year per logistics company. Insurance underwriter add-on.",
        signal: "Infrastructure complaints in supply corridors are leading indicators of supply chain disruption",
        scale: "India logistics market: ₹14.4 lakh crore. Risk intelligence is table stakes for large operators.",
      },
      {
        name: "ESG Intelligence Agent",
        icon: "🌱",
        desc: "Corporate ESG reports require community impact data. AgentSabha gives real citizen sentiment about corporate operations in their constituency. Water usage complaints, pollution reports near industrial areas.",
        revenue: "₹15–75L/year per large corporate for constituency ESG monitoring.",
        signal: "SEBI's BRSR (Business Responsibility and Sustainability Reporting) now mandatory for top 1000 companies",
        scale: "1,000 companies required to file BRSR × ₹20L average = ₹200Cr TAM",
      },
      {
        name: "Real Estate Intelligence Agent",
        icon: "🏘️",
        desc: "Infrastructure complaint resolution patterns are the most accurate predictor of where government investment is coming next — 18 months before construction begins. Identifies future growth corridors.",
        revenue: "₹25L–2Cr/year for large real estate developers, REITs, private equity doing land acquisitions.",
        signal: "MPLAD fund allocation + infrastructure complaint trends = 18-month development signal",
        scale: "India real estate market: $180B. Intelligence that predicts government investment is worth millions per deal.",
      },
      {
        name: "Workforce Intelligence Agent",
        icon: "👷",
        desc: "Employment-related complaints per constituency → workforce availability and skill gap mapping. Education complaints → literacy/skill level signal. Migration complaints → labor supply stress indicators.",
        revenue: "₹10–30L/year per staffing company, manufacturing firm, or factory operator.",
        signal: "MGNREGA demand, employment exchange complaints, skill gap issues all appear in issue clusters",
        scale: "India staffing industry: ₹50,000Cr+. Workforce geography intelligence is persistent pain point.",
      },
    ],
  },
  {
    id: "financial",
    label: "Financial Sector",
    sublabel: "The highest-value data buyer",
    color: "#B45309",
    bg: "#FFFBEB",
    textColor: "#1B2A4A",
    revenue: "₹20–150Cr/year",
    revenueColor: "#B45309",
    tam: "India financial services data market: $500M+",
    why: "Financial institutions price risk using data. AgentSabha generates the most granular real-time constituency-level economic stress data in India. Banks, insurers, and fintechs cannot get this from any other source.",
    agents: [
      {
        name: "Credit Risk Intelligence Agent",
        icon: "💳",
        desc: "Infrastructure health score per constituency as a proxy for regional economic health. Chronic water shortage + road failure + power cuts → high economic stress → elevated credit default risk. Feed to NBFC underwriting models.",
        revenue: "₹20–100L/year per bank / NBFC. API pricing per constituency data point.",
        signal: "Infrastructure distress and consumer credit performance are highly correlated at district level",
        scale: "India has 100,000+ NBFC branches using geographic risk models. RBI mandates stress testing.",
      },
      {
        name: "Insurance Risk Agent",
        icon: "🛡️",
        desc: "Flood complaints, road damage, structural failure patterns = actuarial risk data for crop insurance, property insurance, vehicle insurance. Real-time risk map vs static census-based models currently used.",
        revenue: "₹25–200L/year per insurer. Per-constituency risk score API.",
        signal: "India's general insurance industry uses 5-year-old census data for geographic risk pricing. Live data is a 10x improvement.",
        scale: "India general insurance: ₹2.5 lakh crore premium. 1% better risk pricing = ₹2,500Cr in value.",
      },
      {
        name: "Fintech Expansion Agent",
        icon: "📱",
        desc: "Identifies underbanked / underinsured constituencies ready for financial product penetration. Infrastructure readiness (power, connectivity) + complaint volume = addressable fintech market signal.",
        revenue: "₹10–50L/year per fintech company for market expansion mapping.",
        signal: "Jan Dhan accounts exist in 98% of India but usage is low. Identifying activation-ready pockets is the business problem.",
        scale: "500+ active fintechs in India all solving for geographic expansion. This is a standard data buy.",
      },
      {
        name: "Impact Investment Intelligence Agent",
        icon: "💰",
        desc: "Development finance institutions (ADB, World Bank, IFC) need constituency-level development gap data for project targeting and impact measurement. AgentSabha is the only real-time source.",
        revenue: "₹50L–5Cr per DFI project or annual data partnership.",
        signal: "World Bank India portfolio: $20B+. They spend heavily on ground-truth data.",
        scale: "IFC, ADB, AIIB, JICA all operate in India. Development data is a consistent procurement need.",
      },
    ],
  },
  {
    id: "media",
    label: "Media & Research",
    sublabel: "Credibility multiplier + recurring API revenue",
    color: "#C8592A",
    bg: "#FFF3EE",
    textColor: "#1B2A4A",
    revenue: "₹3–20Cr/year",
    revenueColor: "#C8592A",
    tam: "India media + research data market: $300M+",
    why: "Political and civic data is the fastest-growing segment of the Indian media market. Election coverage alone drives ₹15,000Cr+ in ad spend. AgentSabha sits on the most granular pre-election constituency mood data ever created.",
    agents: [
      {
        name: "Election Intelligence Agent",
        icon: "🗳️",
        desc: "Issue velocity by constituency = real-time electoral mood tracker. Which issues are rising fastest 90 days before election → predictive signal for swing constituencies. Sold to political parties, TV channels, psephologists.",
        revenue: "₹50L–5Cr per political party per election cycle. TV channel election coverage package: ₹1–3Cr.",
        signal: "THIS IS THE BIGGEST SINGLE REVENUE EVENT. Lok Sabha elections every 5 years. State elections constantly rolling.",
        scale: "2024 Lok Sabha: 100+ polling agencies sold data. AgentSabha would be the only continuous (not sampled) constituency data.",
      },
      {
        name: "Investigative Journalism Agent",
        icon: "📰",
        desc: "Constructs investigative story leads from pattern data. Cross-constituency comparison of road fund allocation vs complaint density → corruption signal. Ministry response rate analysis → accountability story.",
        revenue: "₹2–10L/month per national publication. Investigative journalism API.",
        signal: "NYT, Guardian, Reuters all pay for structured data APIs. Indian publications are building data teams.",
        scale: "20 major national publications × ₹5L/month = ₹12Cr/year baseline",
      },
      {
        name: "Academic Research Agent",
        icon: "🎓",
        desc: "Structured, longitudinal constituency data for political science, public policy, economics researchers. Anonymised issue dataset: the most comprehensive constituency-level social data in Indian academic history.",
        revenue: "₹5–50L/year per university / think tank. Data licensing to international research institutions.",
        signal: "Harvard Kennedy School, LSE, IIPA, CPR all study Indian democracy with inferior data",
        scale: "100+ institutions studying Indian democracy globally. Open-access tier drives credibility; premium tier drives revenue.",
      },
      {
        name: "Think Tank Policy Agent",
        icon: "💡",
        desc: "Generates evidence-based policy briefs for think tanks. 'Infrastructure investment gap per constituency based on 12 months of citizen reports' — publishable, citable, fundable research output.",
        revenue: "₹10–50L/year. Grant-funded research partnerships with NITI Aayog, PRS India.",
        signal: "Policy briefs from AgentSabha data = credibility that money cannot buy directly",
        scale: "The brand multiplier: one NITI Aayog citation is worth ₹10Cr in trust-building",
      },
    ],
  },
  {
    id: "platform",
    label: "Platform / Infrastructure",
    sublabel: "The endgame — global licensing",
    color: "#065F46",
    bg: "#ECFDF5",
    textColor: "#1B2A4A",
    revenue: "₹50–500Cr/year",
    revenueColor: "#065F46",
    tam: "Global parliamentary democracy: 193 countries",
    why: "The AgentSabha protocol — if open-sourced and modular — can be licensed to any parliamentary democracy. UK (650 constituencies), Canada (338), Australia (151), South Africa (400). The IP is in the parliamentary rules encoding + multi-agent orchestration, not the Indian data.",
    agents: [
      {
        name: "Democracy Export Agent",
        icon: "🌍",
        desc: "White-label AgentSabha for other parliamentary democracies. UK Parliament (650 constituencies), European Parliament (705 MEPs), Canadian Parliament (338 ridings). Core protocol + localisation layer.",
        revenue: "₹10–100Cr/year per country deployment. Westminster system has 52 countries.",
        signal: "Every Westminster parliamentary democracy has the same representation bandwidth crisis",
        scale: "52 Westminster democracies × ₹20Cr average = ₹1,040Cr potential. This is a $100M+ company builder.",
      },
      {
        name: "Municipal Corporation Agent",
        icon: "🏘️",
        desc: "Scale down to ward level: one AI agent per ward in every municipal corporation. Mumbai (227 wards), Delhi (272), Bengaluru (198). City-level civic intelligence at hyper-local resolution.",
        revenue: "₹2–10Cr/year per municipal corporation. 100 major MCs in India = ₹200–1000Cr potential.",
        signal: "Municipal governance is where citizens interact with government most directly. The complaint volume is 100x higher at ward level.",
        scale: "India has 4,000+ urban local bodies. Even 5% penetration is a massive market.",
      },
      {
        name: "Agent-as-a-Service (AaaS)",
        icon: "⚙️",
        desc: "License the multi-agent orchestration infrastructure to other GovTech companies. They bring domain expertise (health, education, agriculture); AgentSabha provides the citizen intake, clustering, and parliamentary action layers as APIs.",
        revenue: "₹50L–5Cr/year per GovTech company. Revenue share model for downstream monetisation.",
        signal: "GovTech ecosystem in India: 1,000+ startups. Most are building point solutions that need a citizen intelligence layer.",
        scale: "Platform play: own the infrastructure, let others build the applications. AWS model for civic AI.",
      },
      {
        name: "Constituency Data Marketplace",
        icon: "🗃️",
        desc: "Open marketplace where approved buyers (researchers, journalists, NGOs, corporates) can purchase constituency data packages. Standard APIs, self-serve purchasing, tiered access levels.",
        revenue: "15–30% marketplace take rate on all data transactions. Data subscription bundles: ₹1–10L/year.",
        signal: "Data marketplaces are the highest-margin SaaS businesses. Once data is created, marginal cost of distribution approaches zero.",
        scale: "If total data sold is ₹100Cr/year, marketplace take = ₹15–30Cr at near-zero marginal cost",
      },
    ],
  },
];

const FLYWHEEL = [
  { step: "01", label: "Citizens submit issues", sub: "WhatsApp · Web · IVRS · Voice", color: "#FF9933" },
  { step: "02", label: "AI clusters into intelligence", sub: "Patterns · Trends · Severity · Geography", color: "#C8592A" },
  { step: "03", label: "Parliamentary action happens", sub: "Questions · Zero Hour · Debates · Bills", color: "#1B2A4A" },
  { step: "04", label: "Government + corporates buy the data", sub: "B2G · B2B · Financial · Media", color: "#2D6A4F" },
  { step: "05", label: "Revenue funds more citizen tools", sub: "Scheme matching · Legal aid · RTI · NGO routing", color: "#1D4ED8" },
  { step: "06", label: "Better tools → more citizen submissions", sub: "Trust compounds · Data density increases · Moat deepens", color: "#7C3AED" },
];

const REVENUE_SUMMARY = [
  { vertical: "Citizen Welfare (B2C)", year1: "₹50L", year3: "₹5Cr", year5: "₹25Cr", model: "Freemium + referral", color: "#2D6A4F" },
  { vertical: "Government Intelligence (B2G)", year1: "₹2Cr", year3: "₹20Cr", year5: "₹80Cr", model: "Annual contracts", color: "#1D4ED8" },
  { vertical: "Corporate Intelligence (B2B)", year1: "₹1Cr", year3: "₹15Cr", year5: "₹60Cr", model: "SaaS subscriptions", color: "#7C3AED" },
  { vertical: "Financial Sector (B2B)", year1: "₹2Cr", year3: "₹25Cr", year5: "₹100Cr", model: "API + risk scores", color: "#B45309" },
  { vertical: "Media & Research", year1: "₹50L", year3: "₹8Cr", year5: "₹25Cr", model: "API + election cycles", color: "#C8592A" },
  { vertical: "Platform Licensing", year1: "₹0", year3: "₹10Cr", year5: "₹200Cr", model: "Licensing + marketplace", color: "#065F46" },
  { vertical: "MP Intelligence (existing)", year1: "₹2Cr", year3: "₹15Cr", year5: "₹40Cr", model: "₹50K/month per MP", color: "#FF9933" },
];

export default function AgentGalaxy() {
  const [activeVertical, setActiveVertical] = useState("civic");
  const [activeAgent, setActiveAgent] = useState(null);
  const [view, setView] = useState("galaxy");

  const vertical = VERTICALS.find(v => v.id === activeVertical);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0F1923", minHeight: "100vh", color: "#FAF3E0" }}>

      {/* Top nav */}
      <div style={{ background: "#0A1015", borderBottom: "1px solid #1e2d3d", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <span style={{ color: "#FF9933", fontWeight: 700, fontSize: 15 }}>AgentSabha</span>
          <span style={{ color: "#FAF3E0", opacity: 0.3, margin: "0 8px" }}>·</span>
          <span style={{ color: "#FAF3E0", opacity: 0.5, fontSize: 11 }}>Full Agent Galaxy + Revenue Architecture</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["galaxy", "flywheel", "revenue"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? "#FF9933" : "transparent",
              color: view === v ? "#1B2A4A" : "#FAF3E0",
              border: "0.5px solid",
              borderColor: view === v ? "#FF9933" : "#2a3a4a",
              padding: "5px 12px",
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 3,
              cursor: "pointer",
              textTransform: "capitalize",
              letterSpacing: "0.04em",
            }}>{v === "galaxy" ? "Agent Galaxy" : v === "flywheel" ? "Data Flywheel" : "Revenue Model"}</button>
          ))}
        </div>
      </div>

      {/* GALAXY VIEW */}
      {view === "galaxy" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", height: "calc(100vh - 49px)" }}>

          {/* Left sidebar — vertical picker */}
          <div style={{ background: "#0A1015", borderRight: "0.5px solid #1e2d3d", overflowY: "auto", padding: "12px 0" }}>
            {VERTICALS.map(v => (
              <div key={v.id} onClick={() => { setActiveVertical(v.id); setActiveAgent(null); }} style={{
                padding: "11px 16px",
                cursor: "pointer",
                background: activeVertical === v.id ? "#1e2d3d" : "transparent",
                borderLeft: activeVertical === v.id ? `3px solid ${v.color}` : "3px solid transparent",
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: activeVertical === v.id ? v.color : "#FAF3E0", opacity: activeVertical === v.id ? 1 : 0.65 }}>{v.label}</div>
                <div style={{ fontSize: 9.5, color: "#FAF3E0", opacity: 0.35, marginTop: 2 }}>{v.sublabel}</div>
                <div style={{ fontSize: 10, color: v.color, marginTop: 4, fontWeight: 600, opacity: activeVertical === v.id ? 1 : 0.5 }}>{v.revenue}</div>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div style={{ overflowY: "auto", padding: "20px 24px" }}>
            {vertical && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: vertical.color, opacity: 0.7, marginBottom: 5 }}>
                        {vertical.sublabel}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#FAF3E0" }}>{vertical.label}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "#FAF3E0", opacity: 0.4, marginBottom: 2 }}>Revenue potential</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: vertical.revenueColor }}>{vertical.revenue}</div>
                      <div style={{ fontSize: 9, color: "#FAF3E0", opacity: 0.4 }}>{vertical.tam}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.7, lineHeight: 1.65, background: "#1a2635", borderRadius: 6, padding: "10px 14px", borderLeft: `3px solid ${vertical.color}` }}>
                    {vertical.why}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {vertical.agents.map((ag, i) => (
                    <div key={i} onClick={() => setActiveAgent(activeAgent === i ? null : i)} style={{
                      background: "#111d2a",
                      border: `0.5px solid`,
                      borderColor: activeAgent === i ? vertical.color : "#1e2d3d",
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                    }}>
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>{ag.icon}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#FAF3E0", lineHeight: 1.3 }}>{ag.name}</div>
                            <div style={{ fontSize: 10.5, color: "#FAF3E0", opacity: 0.55, marginTop: 3, lineHeight: 1.5 }}>{ag.desc}</div>
                          </div>
                        </div>
                      </div>

                      {activeAgent === i && ag.revenue && (
                        <div style={{ borderTop: `0.5px solid ${vertical.color}22`, background: "#0d1822" }}>
                          <div style={{ padding: "10px 14px" }}>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: vertical.color, opacity: 0.8, marginBottom: 3 }}>Revenue model</div>
                              <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.75, lineHeight: 1.5 }}>{ag.revenue}</div>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#2D6A4F", opacity: 0.8, marginBottom: 3 }}>Data we already have</div>
                              <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.75, lineHeight: 1.5 }}>{ag.signal}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FF9933", opacity: 0.8, marginBottom: 3 }}>Scale signal</div>
                              <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.75, lineHeight: 1.5 }}>{ag.scale}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {!ag.revenue && activeAgent !== i && (
                        <div style={{ borderTop: `0.5px solid #1e2d3d`, padding: "6px 14px", fontSize: 9, color: vertical.color, opacity: 0.5 }}>Click to expand ↓</div>
                      )}
                      {ag.revenue && activeAgent !== i && (
                        <div style={{ borderTop: `0.5px solid #1e2d3d`, padding: "6px 14px", fontSize: 9, color: vertical.color, opacity: 0.5 }}>Click for revenue model ↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FLYWHEEL VIEW */}
      {view === "flywheel" && (
        <div style={{ padding: "30px 24px", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF9933", opacity: 0.6, marginBottom: 6 }}>The core insight</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#FAF3E0", marginBottom: 10 }}>AgentSabha is a Data Flywheel</div>
            <div style={{ fontSize: 12.5, color: "#FAF3E0", opacity: 0.65, lineHeight: 1.7, background: "#111d2a", borderRadius: 8, padding: "14px 16px", borderLeft: "3px solid #FF9933" }}>
              The civic layer is free. But every citizen submission creates a structured, Aadhaar-verified, multilingual, real-time data point that no commercial intelligence firm in India has. That data powers 7 verticals of monetisation. Revenue from those verticals funds better citizen tools. Better tools bring more citizens. More citizens deepen the data moat. This is not a GovTech startup — it's a data platform that happens to run a parliament.
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {FLYWHEEL.map((step, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 14, marginBottom: i < FLYWHEEL.length - 1 ? 0 : 0, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: step.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#FAF3E0", flexShrink: 0, zIndex: 1 }}>
                    {step.step}
                  </div>
                  {i < FLYWHEEL.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: "#1e2d3d", minHeight: 28 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FAF3E0", marginBottom: 3 }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.5 }}>{step.sub}</div>
                </div>
              </div>
            ))}

            {/* Loop indicator */}
            <div style={{ background: "#111d2a", borderRadius: 8, padding: "12px 16px", border: "0.5px dashed #FF993355", marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FF993322", border: "1.5px dashed #FF9933", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>↻</div>
              <div style={{ fontSize: 11.5, color: "#FF9933", lineHeight: 1.6 }}>
                <strong>The flywheel compounds.</strong> Each revolution makes the data denser, the moat deeper, the product more valuable, and the switching cost higher. By year 3, AgentSabha has the only longitudinal, verified, constituency-level social dataset in India's history. That is not replaceable.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Data moat", value: "After 3 years of daily data, the asset is irreproducible without starting over", color: "#FF9933" },
              { label: "Network effect", value: "More constituencies → better cross-constituency intelligence → more value for every buyer", color: "#2D6A4F" },
              { label: "Trust compounding", value: "Every resolved parliamentary action builds citizen trust that drives more submissions", color: "#1D4ED8" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#111d2a", borderRadius: 6, padding: "12px 13px", borderTop: `2px solid ${item.color}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: item.color, marginBottom: 5 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.65, lineHeight: 1.5 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVENUE VIEW */}
      {view === "revenue" && (
        <div style={{ padding: "24px", maxWidth: 780, margin: "0 auto" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF9933", opacity: 0.6, marginBottom: 6 }}>Revenue projections</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#FAF3E0", marginBottom: 16 }}>From civic infrastructure to ₹530Cr/year business</div>

          <div style={{ background: "#111d2a", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1.4fr", background: "#0A1015", padding: "9px 14px" }}>
              {["Vertical", "Year 1", "Year 3", "Year 5", "Revenue model"].map((h, i) => (
                <div key={i} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FAF3E0", opacity: 0.4 }}>{h}</div>
              ))}
            </div>
            {REVENUE_SUMMARY.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1.4fr",
                padding: "10px 14px",
                borderTop: "0.5px solid #1e2d3d",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 1, background: row.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#FAF3E0" }}>{row.vertical}</div>
                </div>
                <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.5 }}>{row.year1}</div>
                <div style={{ fontSize: 12, color: "#FAF3E0", opacity: 0.75 }}>{row.year3}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: row.color }}>{row.year5}</div>
                <div style={{ fontSize: 10, color: "#FAF3E0", opacity: 0.45 }}>{row.model}</div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #2a3a4a", padding: "10px 14px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1.4fr", background: "#0d1822" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FF9933" }}>TOTAL</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#FAF3E0", opacity: 0.6 }}>~₹7.5Cr</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#FAF3E0", opacity: 0.8 }}>~₹98Cr</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#FF9933" }}>~₹530Cr</div>
              <div style={{ fontSize: 10, color: "#FAF3E0", opacity: 0.4 }}>Conservative estimate</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#111d2a", borderRadius: 8, padding: "14px 16px", borderTop: "2px solid #FF9933" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FF9933", marginBottom: 8 }}>The single biggest revenue event</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#FAF3E0", marginBottom: 5 }}>Election Intelligence — ₹5–50Cr per Lok Sabha cycle</div>
              <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.65, lineHeight: 1.6 }}>
                Issue velocity data 90 days before election = the most granular constituency mood data ever built. Political parties pay crores for exit polls based on 10,000 samples. AgentSabha has millions of verified data points, continuous, real-time. This single product could fund the entire platform for years.
              </div>
            </div>
            <div style={{ background: "#111d2a", borderRadius: 8, padding: "14px 16px", borderTop: "2px solid #065F46" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#065F46", marginBottom: 8 }}>The highest-margin product</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#FAF3E0", marginBottom: 5 }}>Platform Licensing — near-zero marginal cost</div>
              <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.65, lineHeight: 1.6 }}>
                Once built for India's 543 constituencies, licensing to UK Parliament (650), Canadian Parliament (338), or South Africa (400) is a localisation project — not a rebuild. The protocol is the product. Each new country deployment compounds the IP value.
              </div>
            </div>
          </div>

          <div style={{ background: "#111d2a", borderRadius: 8, padding: "14px 16px", border: "0.5px solid #FF993344" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#FF9933", marginBottom: 6 }}>The strategic sequence</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { year: "Year 1–2", focus: "Build the data asset. Free civic layer. First 100K citizens. 10 pilot constituencies. Trust above revenue.", color: "#C8592A" },
                { year: "Year 2–3", focus: "Monetise the intelligence. MP subscriptions. First govt contracts. Media API. Financial sector pilots. Reach ₹10–15Cr ARR.", color: "#1D4ED8" },
                { year: "Year 3–5", focus: "Platform and export. Vidhan Sabha licensing. International democracies. Data marketplace. Corporate intelligence at scale. ₹100–500Cr ARR.", color: "#065F46" },
              ].map((s, i) => (
                <div key={i} style={{ borderTop: `2px solid ${s.color}`, paddingTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: s.color, marginBottom: 5 }}>{s.year}</div>
                  <div style={{ fontSize: 11, color: "#FAF3E0", opacity: 0.65, lineHeight: 1.55 }}>{s.focus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
