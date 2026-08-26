import logo from "@/assets/techup-logo.png.asset.json";
import { IntakeButton } from "@/components/site/IntakeButton";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Tertiary Support", href: "#tertiary-support" },
  { label: "FAQ", href: "#faq" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_auto] md:items-start">
          <div>
            <img
              src={logo.url}
              alt="TECH-UP Rural-Digital Empowerment NPC logo"
              width={428}
              height={420}
              loading="lazy"
              className="h-14 w-auto object-contain"
            />
            <p className="mt-5 text-base font-semibold text-primary">
              TECH-UP Rural-Digital Empowerment NPC
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Bridging Rural Gaps Through Digital Opportunity
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <IntakeButton>Tertiary Intake</IntakeButton>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {year} TECH-UP Rural-Digital Empowerment NPC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
