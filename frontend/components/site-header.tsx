import Link from "next/link";

type SiteHeaderProps = {
  active?: "home" | "constituency" | "forums" | "mps" | "submit" | "about" | "agents" | "sansaddarpan" | "prototype";
};

const navItems = [
  { href: "/", label: "Home", key: "home" },
  { href: "/constituency", label: "Constituencies", key: "constituency" },
  { href: "/forums", label: "Forums", key: "forums" },
  { href: "/mps", label: "MP Personalities", key: "mps" },
  { href: "/submit", label: "Submit Issue", key: "submit" },
  { href: "/sansaddarpan", label: "SansadDarpan", key: "sansaddarpan" },
  { href: "/agents", label: "Agent System", key: "agents" },
] as const;

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="topbar mandate-frame">
      <Link className="brand-lockup" href="/" aria-label="AgentSabha home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 120 120" role="img">
            <circle cx="60" cy="60" r="50" className="chakra-ring" />
            <circle cx="60" cy="60" r="43" className="chakra-ring inner" />
            <g className="chakra-spokes">
              <line x1="60" y1="17" x2="60" y2="8" />
              <line x1="71" y1="19" x2="74" y2="10" />
              <line x1="81" y1="24" x2="87" y2="17" />
              <line x1="90" y1="33" x2="98" y2="28" />
              <line x1="96" y1="43" x2="105" y2="40" />
              <line x1="101" y1="54" x2="110" y2="54" />
              <line x1="101" y1="66" x2="110" y2="66" />
              <line x1="96" y1="77" x2="105" y2="80" />
              <line x1="90" y1="87" x2="98" y2="92" />
              <line x1="81" y1="96" x2="87" y2="103" />
              <line x1="71" y1="101" x2="74" y2="110" />
              <line x1="60" y1="103" x2="60" y2="112" />
              <line x1="49" y1="101" x2="46" y2="110" />
              <line x1="39" y1="96" x2="33" y2="103" />
              <line x1="30" y1="87" x2="22" y2="92" />
              <line x1="24" y1="77" x2="15" y2="80" />
              <line x1="19" y1="66" x2="10" y2="66" />
              <line x1="19" y1="54" x2="10" y2="54" />
              <line x1="24" y1="43" x2="15" y2="40" />
              <line x1="30" y1="33" x2="22" y2="28" />
              <line x1="39" y1="24" x2="33" y2="17" />
              <line x1="49" y1="19" x2="46" y2="10" />
            </g>
            <g className="chakra-nodes">
              <circle cx="60" cy="8" r="3.4" />
              <circle cx="74" cy="10" r="3.4" />
              <circle cx="87" cy="17" r="3.4" />
              <circle cx="98" cy="28" r="3.4" />
              <circle cx="105" cy="40" r="3.4" />
              <circle cx="110" cy="54" r="3.4" />
              <circle cx="110" cy="66" r="3.4" />
              <circle cx="105" cy="80" r="3.4" />
              <circle cx="98" cy="92" r="3.4" />
              <circle cx="87" cy="103" r="3.4" />
              <circle cx="74" cy="110" r="3.4" />
              <circle cx="60" cy="112" r="3.4" />
              <circle cx="46" cy="110" r="3.4" />
              <circle cx="33" cy="103" r="3.4" />
              <circle cx="22" cy="92" r="3.4" />
              <circle cx="15" cy="80" r="3.4" />
              <circle cx="10" cy="66" r="3.4" />
              <circle cx="10" cy="54" r="3.4" />
              <circle cx="15" cy="40" r="3.4" />
              <circle cx="22" cy="28" r="3.4" />
              <circle cx="33" cy="17" r="3.4" />
              <circle cx="46" cy="10" r="3.4" />
            </g>
            <path className="dome-shape" d="M42 67c4-13 11-20 18-20s14 7 18 20H42zm4 7h28v6H46z" />
          </svg>
        </span>
        <span className="brand-copy">
          <strong>AgentSabha</strong>
          <span>एजेंट सभा</span>
        </span>
      </Link>

      <nav className="prototype-nav" aria-label="Primary">
        {navItems.map((item) => (
          <Link key={item.href} className={`screen-link${active === item.key ? " active" : ""}`} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <nav className="top-actions">
        <Link className="outline-button button-link" href="/submit">
          Submit Issue
        </Link>
        <button className="language-toggle" type="button" aria-pressed="false" aria-label="Language toggle">
          <span>EN</span>
          <span className="divider">|</span>
          <span>हिं</span>
        </button>
      </nav>
    </header>
  );
}
