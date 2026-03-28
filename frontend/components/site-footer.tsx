type SiteFooterProps = {
  note: string;
  brand?: string;
  endLabel?: string;
};

export function SiteFooter({ note, brand = "AgentSabha", endLabel = "Built for Bharat" }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <strong>{brand}</strong>
          <span>{note}</span>
        </div>
        <span>{endLabel}</span>
      </div>
    </footer>
  );
}
