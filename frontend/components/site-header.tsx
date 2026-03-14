import Link from "next/link";

type SiteHeaderProps = {
  active?: "home" | "constituency" | "submit" | "about" | "prototype";
};

const navItems = [
  { href: "/", label: "Home", key: "home" },
  { href: "/constituency/1", label: "Constituency", key: "constituency" },
  { href: "/submit", label: "Submit", key: "submit" },
  { href: "/about", label: "About", key: "about" },
  { href: "/prototype", label: "Prototype", key: "prototype" },
] as const;

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="topbar mandate-frame">
      <Link className="brand-lockup" href="/" aria-label="AgentSabha home">
        <span className="brand-mark small-mark" aria-hidden="true">
          <svg viewBox="0 0 120 120" role="img">
            <circle cx="60" cy="60" r="50" className="chakra-ring" />
            <circle cx="60" cy="60" r="43" className="chakra-ring inner" />
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
      </nav>
    </header>
  );
}
