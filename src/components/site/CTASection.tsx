import { IntakeButton } from "@/components/site/IntakeButton";
import { Reveal } from "@/components/site/Reveal";

export function CTASection() {
  return (
    <section className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 md:pb-28 lg:px-8">
        <Reveal className="brand-gradient overflow-hidden rounded-[1.75rem] px-6 py-14 text-center text-primary-foreground sm:px-12 md:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Take the Next Step?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
            If you're preparing for tertiary study, begin by completing the TECH-UP Tertiary Intake.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <IntakeButton variant="onDark" size="lg">
              Start Tertiary Intake
            </IntakeButton>
            <a
              href="#about"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary-foreground/35 px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Learn About TECH-UP
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
