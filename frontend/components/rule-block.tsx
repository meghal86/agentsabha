export function RuleBlock({ title, hindiTitle, rules }: { title: string; hindiTitle: string; rules: string[] }) {
  return (
    <section className="rule-block">
      <div className="section-heading small">
        <p>{title.toUpperCase()}</p>
        <h4>{hindiTitle}</h4>
      </div>
      <ul>
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </section>
  );
}
