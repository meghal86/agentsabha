export type WeeklyBrief = {
  slug: string;
  weekLabel: string;
  publishDate: string;
  constituency: string;
  state: string;
  mpName: string;
  mpParty: string;
  headline: string;
  summary: string;
  heroNote: string;
  welfareGaps: Array<{
    title: string;
    detail: string;
    whyItMatters: string;
  }>;
  auditHook: {
    title: string;
    body: string;
    sourceLabel: string;
  };
  parliamentaryMove: {
    title: string;
    body: string;
    draftQuestion: string;
  };
  anomaly: {
    title: string;
    body: string;
  };
  sdgTrend: {
    title: string;
    body: string;
  };
  mpSummary: string[];
  videoSegments: Array<{
    title: string;
    body: string;
  }>;
  sourceTrail: Array<{
    label: string;
    note: string;
  }>;
};

export const weeklyBriefs: WeeklyBrief[] = [
  {
    slug: "gurugram-housing-and-wage-delays",
    weekLabel: "Week 1",
    publishDate: "April 2026",
    constituency: "Gurugram",
    state: "Haryana",
    mpName: "Rao Inderjit Singh",
    mpParty: "Bharatiya Janata Party",
    headline: "AI found a housing-delivery and wage-delay brief that could matter to thousands of Gurugram families this week.",
    summary:
      "This pilot brief shows what a world-class AI research assistant can prepare for one MP in one constituency: the delivery gap, the audit hook, the parliamentary question, and the citizen-facing narrative.",
    heroNote:
      "This is not a scorecard. It is a weekly constituency research brief demonstrating what AI can discover and package for an MP within one working cycle.",
    welfareGaps: [
      {
        title: "MGNREGS wage delay remains elevated",
        detail: "The current evidence layer flags an average wage delay of 19 days against an India benchmark of 11 days.",
        whyItMatters: "Delayed payment turns a livelihood scheme into a debt cycle, especially for households already using wage work as a fallback income source.",
      },
      {
        title: "PMAY completion is trailing the national benchmark",
        detail: "The housing completion signal in the current register is 74% against an India benchmark of 82%.",
        whyItMatters: "Incomplete housing delivery means sanctioned households stay trapped between allocation announcements and actual habitation.",
      },
      {
        title: "The constituency needs tighter ministry follow-through",
        detail: "The public evidence layer does not yet show a clear parliamentary follow-up chain linking these delivery gaps to recent floor action.",
        whyItMatters: "The opportunity is not only to identify the gap, but to translate it into a question, notice, or ministerial answer on record.",
      },
    ],
    auditHook: {
      title: "Audit hook for this week",
      body:
        "AI should pair the housing gap with the broader CAG-style question of whether sanctioned beneficiaries are moving from approval to completed possession on schedule, and whether delay reasons are being recorded in a usable way.",
      sourceLabel: "Housing delivery evidence + public audit framing",
    },
    parliamentaryMove: {
      title: "One parliamentary question AI would hand to the MP",
      body:
        "A single well-framed starred or unstarred question can force a ministry response on wage-delay backlog and housing completion slippage without turning the issue into an accusation.",
      draftQuestion:
        "Will the Minister of Rural Development be pleased to state whether the Government has reviewed constituency-level MGNREGS wage delays in Gurugram, Haryana, and the steps proposed to bring pending payments within the national service window?",
    },
    anomaly: {
      title: "MGNREGS anomaly",
      body:
        "The signal is not only that wages are late. The anomaly is that a high-capacity district still shows delay significantly above the national comparison line, suggesting administrative follow-through is the weak point rather than scheme design alone.",
    },
    sdgTrend: {
      title: "SDG trend to track",
      body:
        "For the weekly brief, AI should keep a standing trendline on housing security, livelihood reliability, and local service delivery so the constituency story becomes cumulative rather than episodic.",
    },
    mpSummary: [
      "This week’s highest-value move is to surface wage-delay accountability through one formal parliamentary question.",
      "Link housing completion slippage to a ministry response timeline rather than a general political speech.",
      "Use the brief publicly as proof that the constituency’s issues can be translated into actionable parliamentary language within 24 hours.",
    ],
    videoSegments: [
      {
        title: "Opening",
        body:
          "This week we looked at Gurugram. Not to grade the MP, but to show what AI can uncover for one constituency in a single working cycle.",
      },
      {
        title: "What AI found",
        body:
          "The two strongest signals were delayed MGNREGS wages and a housing-completion gap. These are not abstract governance themes. They are delivery problems affecting household stability now.",
      },
      {
        title: "What the MP could do next",
        body:
          "AI turned that evidence into one parliamentary question that could force the ministry to answer on record. That is the point of this exercise: not surveillance, but usable assistance.",
      },
      {
        title: "Why this matters",
        body:
          "If one constituency can receive this level of research support every week, then all 543 constituencies eventually can. That is the real public promise of AI here.",
      },
    ],
    sourceTrail: [
      {
        label: "SansadDarpan welfare register",
        note: "Current constituency signals for MGNREGS delay and PMAY completion.",
      },
      {
        label: "Question Hour drafting logic",
        note: "Existing parliamentary drafting engine already supports source-backed question creation.",
      },
      {
        label: "Constituency intelligence layer",
        note: "This weekly brief is built from the same evidence pipeline that powers the constituency and SansadDarpan surfaces.",
      },
    ],
  },
];

export function getWeeklyBrief(slug: string) {
  return weeklyBriefs.find((brief) => brief.slug === slug) ?? null;
}
