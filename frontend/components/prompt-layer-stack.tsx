export function PromptLayerStack({
  layerOne,
  layerTwo,
  layerThree,
}: {
  layerOne: string;
  layerTwo: string;
  layerThree: string;
}) {
  return (
    <section className="prompt-layer-stack">
      <div className="section-heading small">
        <p>PROMPT ARCHITECTURE</p>
        <h4>तीन-स्तरीय संरचना</h4>
      </div>
      <div className="dashboard-summary-grid">
        <article className="summary-tile">
          <span className="summary-kicker">Layer 1</span>
          <strong>Who they are</strong>
          <p>{layerOne}</p>
        </article>
        <article className="summary-tile accent-tile">
          <span className="summary-kicker">Layer 2</span>
          <strong>Where they are</strong>
          <p>{layerTwo}</p>
        </article>
        <article className="summary-tile">
          <span className="summary-kicker">Layer 3</span>
          <strong>What they know now</strong>
          <p>{layerThree}</p>
        </article>
      </div>
    </section>
  );
}
