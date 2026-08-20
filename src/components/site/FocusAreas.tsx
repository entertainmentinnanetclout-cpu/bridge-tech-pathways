import { Compass, Laptop, ScrollText, Users } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";

const areas = [
  {
    icon: Laptop,
    title: "Digital Empowerment",
    body: "Support access to digital tools, knowledge and practical digital participation.",
  },
  {
    icon: ScrollText,
    title: "Tertiary Readiness",
    body: "Help prospective students organise the information and documentation needed to pursue tertiary study opportunities.",
  },
  {
    icon: Compass,
    title: "Opportunity Navigation",
    body: "Make complicated digital processes easier to understand and access.",
  },
  {
    icon: Users,
    title: "Community Development",
    body: "Support initiatives designed around the real needs and realities of rural communities.",
  },
];

export function FocusAreas() {
  return (
    <section id="what-we-do" className="scroll-mt-24 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">
            What we do
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Creating Pathways to Opportunity
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {areas.map((area, index) => (
            <Reveal
              key={area.title}
              delay={index * 80}
              className="group rounded-2xl border border-border/80 bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-turquoise/40 hover:shadow-soft"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-brand-turquoise/15">
                <area.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{area.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{area.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
