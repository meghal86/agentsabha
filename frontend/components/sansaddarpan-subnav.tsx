import Link from "next/link";

type SansadDarpanSubnavProps = {
  active?: "overview" | "mps" | "constituencies" | "rule-deviations" | "methodology";
};

const items = [
  { href: "/sansaddarpan", label: "Dashboard", key: "overview" },
  { href: "/sansaddarpan/mps", label: "MP Scorecards", key: "mps" },
  { href: "/sansaddarpan/constituencies", label: "Welfare", key: "constituencies" },
  { href: "/sansaddarpan/rule-deviations", label: "Rule Deviations", key: "rule-deviations" },
  { href: "/sansaddarpan/methodology", label: "Methodology", key: "methodology" },
] as const;

export function SansadDarpanSubnav({ active }: SansadDarpanSubnavProps) {
  return (
    <nav className="sansaddarpan-subnav" aria-label="SansadDarpan sections">
      {items.map((item) => (
        <Link key={item.href} className={`sansaddarpan-subnav-link${active === item.key ? " active" : ""}`} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
