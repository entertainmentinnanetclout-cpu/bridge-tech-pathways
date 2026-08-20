import { GraduationCap, Signal, Sprout } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";

const focus = [
  {
    icon: Signal,
    title: "Digital Access",
    body: "Tools, information and pathways that improve access to the digital economy.",
  },
  {
    icon: GraduationCap,
    title: "Education Pathways",
    body: "Helping prospective students better prepare for tertiary opportunities.",
  },
  {
    icon: Sprout,
    title: "Rural Empowerment",
    body: "Using technology as an enabler for long-term community participation and development.",
  },
];

export function IntroBand() {
  return (
    <section className="border-y border-border/70 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <Reveal className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl md:text-4xl">
            Technology should create opportunity — wherever you live.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            TECH-UP focuses on helping close the distance between rural communities and the
            opportunities increasingly delivered through digital systems, education platforms and
            connected institutions.
          </p>
        </Reveal>

        <dl className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {focus.map((item, index) => (
            <Reveal key={item.title} delay={index * 90} className="border-t border-border pt-6">
              <item.icon className="size-6 text-brand-turquoise" aria-hidden="true" />
              <dt className="mt-4 text-lg font-semibold text-foreground">{item.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
