import { IntakeButton } from "@/components/site/IntakeButton";
import { Reveal } from "@/components/site/Reveal";

const steps = [
  { number: "01", title: "Your Information", body: "Personal and contact information." },
  { number: "02", title: "Next of Kin", body: "Relevant guardian or next-of-kin details." },
  {
    number: "03",
    title: "Study Preferences",
    body: "Current academic status, target institutions and preferred qualifications.",
  },
  {
    number: "04",
    title: "Supporting Documents",
    body: "Documents needed to help establish application readiness.",
  },
];

export function IntakeProcess() {
  return (
    <section className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            What the Tertiary Intake Covers
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal
              key={step.number}
              as="li"
              delay={index * 80}
              className="bg-card p-7"
            >
              <span className="text-sm font-semibold tracking-[0.18em] text-brand-turquoise">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-10">
          <IntakeButton size="lg">Start My Intake</IntakeButton>
        </div>
      </div>
    </section>
  );
}
