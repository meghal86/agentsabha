export function SiteFooter({ note }: { note: string }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <strong>AgentSabha</strong>
          <span>{note}</span>
        </div>
        <span>Built for Bharat</span>
      </div>
    </footer>
  );
}
