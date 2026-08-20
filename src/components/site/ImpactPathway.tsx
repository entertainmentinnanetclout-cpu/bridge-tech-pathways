import { Reveal } from "@/components/site/Reveal";

const stages = [
  { title: "Access", body: "Helping people reach information and digital tools." },
  { title: "Readiness", body: "Helping individuals understand what is required." },
  { title: "Navigation", body: "Making complex digital processes easier to approach." },
  {
    title: "Opportunity",
    body: "Helping communities become better positioned to pursue education and development opportunities.",
  },
];

export function ImpactPathway() {
  return (
    <section id="our-approach" className="scroll-mt-24 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">
            Our approach
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            From Access to Opportunity
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, index) => (
            <Reveal
              key={stage.title}
              as="li"
              delay={index * 90}
              className="relative rounded-2xl border border-border/80 bg-card p-7"
            >
              <span
                aria-hidden="true"
                className="block h-1 w-12 rounded-full brand-gradient"
              />
              <h3 className="mt-5 text-xl font-semibold text-primary">{stage.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
              <span className="mt-5 block text-xs font-semibold tracking-[0.18em] text-brand-turquoise">
                {`0${index + 1}`}
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
