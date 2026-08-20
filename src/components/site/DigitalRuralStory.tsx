import { BookOpen, Home, Sparkles, Wifi } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";

const barriers = [
  "connectivity",
  "information",
  "devices",
  "digital literacy",
  "application readiness",
  "access to support",
];

const journey = [
  { icon: Home, label: "Community" },
  { icon: Wifi, label: "Connectivity" },
  { icon: BookOpen, label: "Knowledge" },
  { icon: Sparkles, label: "Opportunity" },
];

export function DigitalRuralStory() {
  return (
    <section className="relative overflow-hidden bg-brand-ink text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-green/15 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Why Digital-Rural Empowerment Matters
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/85">
              The distance between a learner and an opportunity is no longer measured only in
              kilometres.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-base text-primary-foreground/70">It can also be measured in:</p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {barriers.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-2 text-sm text-primary-foreground/90"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-base leading-relaxed text-primary-foreground/85">
              TECH-UP exists to help reduce those barriers and create practical routes into
              education, digital participation and future opportunities.
            </p>
          </Reveal>
        </div>

        <Reveal
          delay={150}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0"
          as="ol"
        >
          {journey.map((stage, index) => (
            <li key={stage.label} className="relative flex items-center gap-4 lg:block">
              {index < journey.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-7 right-0 hidden h-px w-full bg-gradient-to-r from-brand-turquoise/70 to-transparent lg:block"
                />
              ) : null}
              <span className="relative z-10 inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-primary-foreground/20 bg-brand-ink text-brand-lime">
                <stage.icon className="size-6" aria-hidden="true" />
              </span>
              <p className="text-base font-semibold lg:mt-5">{stage.label}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
