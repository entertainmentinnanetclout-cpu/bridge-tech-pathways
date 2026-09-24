import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-rural-digital.jpg";
import { IntakeButton } from "@/components/site/IntakeButton";
import { usePublicSetting } from "@/lib/publicSettings";

export function Hero() {
  const heading = usePublicSetting("hero_heading", "Bridging Rural Gaps Through Digital Opportunity.");
  const subheading = usePublicSetting(
    "hero_subheading",
    "TECH-UP Rural-Digital Empowerment NPC works to expand access to digital tools, education pathways and opportunities that help rural communities participate in an increasingly connected world.",
  );
  return (
    <section id="top" className="surface-gradient relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-brand-turquoise/10 blur-3xl"
      />
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pt-14 pb-16 sm:px-6 md:pt-20 md:pb-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">
            Rural-Digital Empowerment
          </p>
          <h1 className="mt-5 text-4xl leading-[1.08] font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subheading}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <IntakeButton size="lg">Start Tertiary Intake</IntakeButton>
            <a
              href="#about"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/20 px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              Discover TECH-UP
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-lift">
            <img
              src={heroImage}
              alt="Illustration of rural farmland with a winding pathway that becomes digital circuit lines leading towards a sunrise"
              width={1408}
              height={1104}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
