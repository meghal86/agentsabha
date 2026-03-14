const rows = [
  "Will the Minister of Road Transport be pleased to state the current sanction status of the Civil Lines school corridor repair plan?",
  "Will the Minister of Jal Shakti be pleased to state ward-wise supply restoration timelines for peri-urban pressure failures?",
  "Will the Minister of Health and Family Welfare be pleased to state the medicine procurement gap for the primary health sub-centre cluster?"
];

export function QuestionLog() {
  return (
    <div className="border border-[#E2D4B0] bg-haath">
      <div className="border-b border-[#E2D4B0] bg-haldi px-4 py-3">
        <h3 className="font-display text-2xl text-neela">Draft Question Log</h3>
        <p className="font-hindi text-lg text-neela/80">मसौदा प्रश्न</p>
      </div>
      <ol className="space-y-4 px-4 py-4">
        {rows.map((row, index) => (
          <li key={row} className="border-l-2 border-kesariya pl-4">
            <div className="font-body text-[11px] uppercase tracking-[0.08em] text-neela/50">Draft {index + 1} · Rule 32</div>
            <p className="mt-1 font-display text-xl leading-snug text-neela">{row}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

