import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/submit", label: "Submit" },
  { href: "/about", label: "About" },
  { href: "/prototype", label: "Prototype 01-08" }
];

export function SiteHeader() {
  return (
    <header className="border-b border-neela/15 bg-haath/95">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-5 md:px-8">
        <Link href="/" className="flex flex-col text-neela">
          <span className="font-display text-3xl font-bold leading-none">AgentSabha</span>
          <span className="font-hindi text-xl leading-none">एजेंट सभा</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="font-body text-sm font-medium uppercase tracking-[0.08em] text-neela/70 transition hover:text-neela">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/submit"
          className="border border-neela bg-neela px-4 py-3 font-display text-lg font-semibold text-haath shadow-[0_3px_0_0_#FF9933]"
        >
          Submit Issue
        </Link>
      </div>
    </header>
  );
}

