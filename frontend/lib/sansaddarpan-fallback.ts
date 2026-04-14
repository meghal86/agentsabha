import type {
  SansadDarpanConstituencyCard,
  SansadDarpanMethodologyResponse,
  SansadDarpanMpListResponse,
  SansadDarpanMpProfile,
  SansadDarpanOverview,
  SansadDarpanRuleDeviationDetail,
  SansadDarpanRuleDeviationListResponse,
  SansadDarpanWeeklyBriefDetail,
  SansadDarpanWeeklyBriefListResponse,
} from "@/lib/api";

export const sansaddarpanOverviewFallback: SansadDarpanOverview = {
  product_name: "SansadDarpan",
  hindi_name: "सांसद दर्पण",
  tagline: "Parliamentary Transparency & Accountability Platform",
  launch_window: "3-month MVP launch",
  primary_users: ["Journalists", "Researchers", "Activists", "Engaged citizens"],
  layer_placement:
    "Layer 3 — public evidence and accountability surface built on parliamentary records, welfare datasets, and verified procedural analysis.",
  sections: [
    {
      slug: "mp-participation",
      title: "MP Participation Scorecard",
      hindi_title: "सांसद भागीदारी स्कोरकार्ड",
      summary:
        "Attendance, questions, debates, Zero Hour mentions, and private member bill activity — benchmarked against national, state, and party averages.",
      metric_label: "Profiles in scope",
      metric_value: "543 MPs",
      href: "/sansaddarpan/mps",
      layer: "Layer 3",
    },
    {
      slug: "constituency-welfare",
      title: "Constituency Welfare Dashboard",
      hindi_title: "कल्याण डैशबोर्ड",
      summary:
        "Welfare datasets are consolidated at constituency level, then linked back to whether the MP raised those issues in Parliament.",
      metric_label: "Scheme lenses",
      metric_value: "5 welfare systems",
      href: "/sansaddarpan/constituencies",
      layer: "Layer 3",
    },
    {
      slug: "rule-deviations",
      title: "Verified Rule Deviation Tracker",
      hindi_title: "नियम विचलन रजिस्टर",
      summary:
        "Human-verified deviations from parliamentary procedure with citations, confidence, and review notes.",
      metric_label: "Seeded cases",
      metric_value: "18 verified cases",
      href: "/sansaddarpan/rule-deviations",
      layer: "Layer 3",
    },
  ],
};

export const sansaddarpanMpsFallback: SansadDarpanMpListResponse = {
  methodology_version: "v1.0 public draft",
  mps: [
    {
      slug: "rahul-gandhi",
      name: "Rahul Gandhi",
      constituency: "Raebareli",
      state: "Uttar Pradesh",
      party: "Indian National Congress",
      attendance_rate: 83.4,
      questions_asked: 34,
      debates: 18,
      score: 78,
      national_rank: 86,
      summary: "Above national average debate participation with strong opposition-floor visibility.",
    },
    {
      slug: "supriya-sule",
      name: "Supriya Sule",
      constituency: "Baramati",
      state: "Maharashtra",
      party: "Nationalist Congress Party (SP)",
      attendance_rate: 89.1,
      questions_asked: 56,
      debates: 21,
      score: 86,
      national_rank: 34,
      summary: "Strong all-round parliamentary participation with high attendance and question volume.",
    },
    {
      slug: "kanimozhi-karunanidhi",
      name: "Kanimozhi Karunanidhi",
      constituency: "Thoothukudi",
      state: "Tamil Nadu",
      party: "Dravida Munnetra Kazhagam",
      attendance_rate: 87.8,
      questions_asked: 41,
      debates: 16,
      score: 80,
      national_rank: 71,
      summary: "Reliable participation with balanced performance across attendance, questions, and debate.",
    },
    {
      slug: "mahua-moitra",
      name: "Mahua Moitra",
      constituency: "Krishnanagar",
      state: "West Bengal",
      party: "All India Trinamool Congress",
      attendance_rate: 79.6,
      questions_asked: 48,
      debates: 24,
      score: 82,
      national_rank: 58,
      summary: "Debate-heavy profile with strong questioning record and visible floor interventions.",
    },
  ],
};

export const sansaddarpanMpProfilesFallback: Record<string, SansadDarpanMpProfile> = {
  "rahul-gandhi": {
    ...sansaddarpanMpsFallback.mps[0],
    zero_hour_mentions: 5,
    private_member_bills: 1,
    voting_participation: 81,
    score_breakdown: { attendance: 25.0, questions: 31.0, debates: 20.0, bonus: 2.0 },
    sources: ["sansad.in member profile", "Lok Sabha debate archive", "Questions list archive"],
    narrative:
      "High visibility in debate and opposition interventions, but question volume remains below the very top-performing legislative specialists.",
    og_ready: true,
  },
  "supriya-sule": {
    ...sansaddarpanMpsFallback.mps[1],
    zero_hour_mentions: 8,
    private_member_bills: 2,
    voting_participation: 88,
    score_breakdown: { attendance: 26.7, questions: 36.0, debates: 21.5, bonus: 1.8 },
    sources: ["sansad.in member profile", "Questions archive", "Zero Hour mention register"],
    narrative:
      "Consistently active across questions, debates, and constituency follow-up, placing her in the upper tier of current Lok Sabha performers.",
    og_ready: true,
  },
  "kanimozhi-karunanidhi": {
    ...sansaddarpanMpsFallback.mps[2],
    zero_hour_mentions: 6,
    private_member_bills: 1,
    voting_participation: 84.2,
    score_breakdown: { attendance: 26.3, questions: 31.8, debates: 19.9, bonus: 2.0 },
    sources: ["sansad.in attendance records", "Questions archive", "Debate transcript index"],
    narrative:
      "Balanced participation profile with reliable attendance, active floor presence, and consistent issue linkage to Tamil Nadu welfare concerns.",
    og_ready: true,
  },
  "mahua-moitra": {
    ...sansaddarpanMpsFallback.mps[3],
    zero_hour_mentions: 7,
    private_member_bills: 0,
    voting_participation: 79.5,
    score_breakdown: { attendance: 23.9, questions: 34.5, debates: 23.1, bonus: 0.0 },
    sources: ["sansad.in attendance register", "Debate transcript archive", "Questions archive"],
    narrative:
      "Lower attendance than the top quartile, but compensated by heavy debate participation and sustained question activity.",
    og_ready: true,
  },
};

export const sansaddarpanConstituenciesFallback: { update_frequency: string; constituencies: SansadDarpanConstituencyCard[] } = {
  update_frequency: "Daily sources, annual SDG refresh",
  constituencies: [
    {
      slug: "gurugram",
      name: "Gurugram",
      state: "Haryana",
      mp_name: "Rao Inderjit Singh",
      top_gap: "MGNREGS wage delay remains above the national average despite repeated local complaints.",
      raised_in_parliament: false,
      metrics: [
        { label: "MGNREGS average delay", value: "19 days", benchmark: "India avg 11 days", status: "alert" },
        { label: "PMAY completion", value: "74%", benchmark: "India avg 82%", status: "pending" },
        { label: "PM Kisan disbursal", value: "91%", benchmark: "India avg 89%", status: "positive" },
      ],
    },
    {
      slug: "thiruvananthapuram",
      name: "Thiruvananthapuram",
      state: "Kerala",
      mp_name: "Shashi Tharoor",
      top_gap: "Ujjwala refill continuity is lagging peri-urban demand despite high connection coverage.",
      raised_in_parliament: true,
      metrics: [
        { label: "MGNREGS average delay", value: "8 days", benchmark: "India avg 11 days", status: "positive" },
        { label: "Ujjwala refill continuity", value: "62%", benchmark: "India avg 71%", status: "alert" },
        { label: "SDG district score", value: "71/100", benchmark: "India top quartile 75+", status: "pending" },
      ],
    },
  ],
};

export const sansaddarpanRuleDeviationsFallback: SansadDarpanRuleDeviationListResponse = {
  human_review_required: true,
  deviations: [
    {
      id: "money-bill-2016",
      title: "Money Bill certification controversy",
      session_label: "Budget Session 2016",
      rule_reference: "Articles 109/110 read with Speaker certification convention",
      confidence: 0.93,
      status: "human-verified",
      summary: "Certification route raised substantial procedural questions about whether the bill fit the Money Bill definition.",
    },
    {
      id: "mass-suspension-2023",
      title: "Mass suspension procedure review",
      session_label: "Winter Session 2023",
      rule_reference: "Lok Sabha Rules on naming and suspension of members",
      confidence: 0.9,
      status: "human-verified",
      summary: "Bulk suspension events triggered a rule-compliance review concerning sequencing, grounds, and opportunity to respond.",
    },
  ],
};

export const sansaddarpanRuleDeviationDetailsFallback: Record<string, SansadDarpanRuleDeviationDetail> = {
  "money-bill-2016": {
    ...sansaddarpanRuleDeviationsFallback.deviations[0],
    analysis:
      "The proceeding record, public objections, and later constitutional litigation indicate a credible deviation question around classification and bicameral scrutiny.",
    primary_sources: ["Lok Sabha proceedings", "Text of the bill", "Supreme Court judgments discussing Article 110"],
    review_notes: ["Published only after manual comparison with constitutional text.", "Reasoning chain archived with citations."],
  },
  "mass-suspension-2023": {
    ...sansaddarpanRuleDeviationsFallback.deviations[1],
    analysis:
      "The issue is not simply political disagreement; it is whether the procedural rule path reflected the text and established precedent in the House record.",
    primary_sources: ["Lok Sabha bulletin", "House transcript", "Rules of Procedure"],
    review_notes: ["Human reviewer compared transcript to rule steps before publication."],
  },
};

export const sansaddarpanMethodologyFallback: SansadDarpanMethodologyResponse = {
  title: "SansadDarpan methodology",
  principles: [
    "Civic, not corporate.",
    "Data is the hero.",
    "Every number links back to a source and a method.",
    "No AI-generated procedural flag is published without human sign-off.",
  ],
  sections: [
    {
      title: "MP participation score",
      body: "Attendance, questions, and debates are benchmarked separately and then recombined into a public score. Private member bills remain a capped bonus, not the dominant factor.",
    },
    {
      title: "Constituency welfare dashboard",
      body: "Welfare metrics are aggregated through a constituency-district crosswalk, then compared with national and state averages. Parliament linkage asks whether the gap was raised on record.",
    },
    {
      title: "Rule deviation tracker",
      body: "Rules of Procedure, Directions by the Speaker, transcript evidence, and judicial precedent are retrieved together. AI reasoning may propose a flag, but only a human reviewer can publish it.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Weekly Briefs fallback — shown when the backend API is unreachable
// ---------------------------------------------------------------------------

export const gorakhpurWeeklyBriefDetail: SansadDarpanWeeklyBriefDetail = {
  id: "fallback-gorakhpur-week-15-2026",
  week_number: 15,
  year: 2026,
  constituency_name: "Gorakhpur",
  constituency_state: "Uttar Pradesh",
  mp_name: "Ravi Kishan",
  headline:
    "AI found three welfare delivery gaps in Gorakhpur that a single parliamentary question could force on record.",
  status: "published",
  youtube_title: "Gorakhpur: What AI found this week — and what the MP could do about it",
  published_at: "2026-04-13T00:00:00Z",
  created_at: "2026-04-12T00:00:00Z",
  brief_markdown: `## Gorakhpur Constituency Intelligence Brief — Week 15, 2026

**Constituency:** Gorakhpur, Uttar Pradesh
**MP:** Ravi Kishan (BJP)
**Brief type:** Weekly AI-generated constituency intelligence

---

### What AI found this week

Three welfare delivery signals came through the evidence layer this week, each with a clear parliamentary follow-through opportunity.

**1. MGNREGS wage delay** — Average delay is tracking at 23 days against a national benchmark of 11 days. The gap is above both the state and national comparison lines.

**2. PMAY housing completion** — Completion rate is at 68% against a national benchmark of 82%. Gorakhpur's sanctioned-to-completed pipeline is slower than comparable Uttar Pradesh districts.

**3. Mid-Day Meal programme** — Two blocks in the constituency show attendance-to-meal-delivery mismatches in the current quarter's data, flagging a potential supply-chain or beneficiary-registration issue.

---

### One parliamentary question AI would hand to the MP

> Will the Minister of Rural Development be pleased to state whether the Government has reviewed MGNREGS wage payment delays in Gorakhpur constituency, and the steps proposed to bring pending disbursements within the national 11-day service window?

---

### Why this matters

These are not abstract governance gaps. They affect household cash flow, housing security, and child nutrition in one of Uttar Pradesh's largest constituencies. The MP who raises these on record sets a standard that data can verify next quarter.`,
  video_script_json: {
    opening:
      "This week we looked at Gorakhpur — not to score the MP, but to show what AI can uncover for one constituency in a single working cycle.",
    findings:
      "Three signals came through: delayed MGNREGS wages, a housing-completion gap, and a mid-day meal delivery mismatch. Each one is a delivery problem affecting families now.",
    action:
      "AI turned that evidence into one parliamentary question that could force the ministry to answer on record.",
    close:
      "If one constituency can receive this level of research support every week, all 543 eventually can. That is the real public promise of AI here.",
  },
  mp_whatsapp_brief:
    "Gorakhpur Week 15 Brief — AI flagged 3 issues: MGNREGS delay (23 days vs 11 day benchmark), PMAY housing at 68% (benchmark 82%), and MDM delivery gap in 2 blocks. One parliamentary question drafted and ready. Full brief available at agentsabha.vercel.app",
  hindi_translation: {
    headline:
      "AI ने गोरखपुर में तीन कल्याण वितरण अंतराल पाए जिन्हें एक संसदीय प्रश्न से दर्ज कराया जा सकता है।",
    mp_whatsapp_brief:
      "गोरखपुर सप्ताह 15 — AI ने 3 मुद्दे पहचाने: MGNREGS देरी (23 दिन बनाम 11 दिन बेंचमार्क), PMAY आवास 68% (बेंचमार्क 82%), और 2 ब्लॉक में MDM वितरण अंतर।",
  },
  youtube_description:
    "This week's Gorakhpur constituency brief covers three welfare delivery gaps identified by AI: MGNREGS wage delays, PMAY housing completion shortfalls, and a Mid-Day Meal programme mismatch. One parliamentary question has been drafted and is ready for use.",
  reel_scripts: [
    {
      hook: "AI looked at Gorakhpur this week. Here's what it found.",
      script:
        "Three delivery gaps. MGNREGS wages delayed by 23 days. Housing completion 14 points below national benchmark. And a mid-day meal mismatch in two blocks. One question to Parliament could put all three on record.",
      caption_en:
        "AI-generated constituency brief for Gorakhpur | Week 15, 2026 | #SansadDarpan #AgentSabha",
      caption_hi:
        "गोरखपुर के लिए AI-जनित निर्वाचन क्षेत्र ब्रीफ | सप्ताह 15, 2026 | #SansadDarpan",
      hashtags: ["#Gorakhpur", "#SansadDarpan", "#AgentSabha", "#MGNREGS", "#PMAY"],
    },
  ],
  generation_source: "fallback",
};

export const sansaddarpanWeeklyBriefsFallback: SansadDarpanWeeklyBriefListResponse = {
  briefs: [
    {
      id: gorakhpurWeeklyBriefDetail.id,
      week_number: gorakhpurWeeklyBriefDetail.week_number,
      year: gorakhpurWeeklyBriefDetail.year,
      constituency_name: gorakhpurWeeklyBriefDetail.constituency_name,
      constituency_state: gorakhpurWeeklyBriefDetail.constituency_state,
      mp_name: gorakhpurWeeklyBriefDetail.mp_name,
      headline: gorakhpurWeeklyBriefDetail.headline,
      status: gorakhpurWeeklyBriefDetail.status,
      youtube_title: gorakhpurWeeklyBriefDetail.youtube_title,
      published_at: gorakhpurWeeklyBriefDetail.published_at,
      created_at: gorakhpurWeeklyBriefDetail.created_at,
    },
  ],
};
