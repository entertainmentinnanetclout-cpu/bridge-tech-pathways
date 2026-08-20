import { IntakeButton } from "@/components/site/IntakeButton";
import { Reveal } from "@/components/site/Reveal";

export function TertiarySupport() {
  return (
    <section
      id="tertiary-support"
      className="brand-gradient relative scroll-mt-24 overflow-hidden text-primary-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.22em] text-primary-foreground/80 uppercase">
            TECH-UP Tertiary Support
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Your Tertiary Journey Starts With Being Prepared.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
            TECH-UP's Tertiary Intake helps collect the essential information needed to understand
            an applicant's current academic position, preferred institutions and qualification
            interests.
          </p>
          <div className="mt-9 flex justify-center">
            <IntakeButton variant="onDark" size="lg">
              Complete Tertiary Intake
            </IntakeButton>
          </div>
          <p className="mt-5 text-sm text-primary-foreground/75">
            You'll complete the intake securely through TECH-UP's current Tally intake form.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
