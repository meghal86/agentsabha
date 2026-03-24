export type SessionQueueItem = {
  title: string;
  role: string;
  status: string;
  note: string;
};

export function SessionQueue({ items }: { items: SessionQueueItem[] }) {
  return (
    <section className="session-queue">
      <div className="section-heading small">
        <p>SESSION QUEUE</p>
        <h4>कार्यसूची</h4>
      </div>
      <div className="session-list">
        {items.map((item) => (
          <article key={`${item.role}-${item.title}`}>
            <span className="stamp-badge neutral">{item.status}</span>
            <h4>{item.title}</h4>
            <p>{item.role}</p>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
