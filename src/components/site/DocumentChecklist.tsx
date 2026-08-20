import { Check, Info } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";

const documents = [
  "Certified applicant ID or passport copy",
  "Latest statement of results or Matric certificate",
  "Proof of residential address",
  "Next-of-kin / guardian ID copy",
];

export function DocumentChecklist() {
  return (
    <section className="bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Prepare Before You Begin
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Applicants should preferably have the following documents available before starting the
            TECH-UP Tertiary Intake.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Having the correct documents ready can make the intake process easier and faster.
          </p>
        </Reveal>

        <Reveal delay={100} className="rounded-2xl border border-border/80 bg-card p-7 shadow-soft sm:p-9">
          <ul className="space-y-4">
            {documents.map((doc) => (
              <li key={doc} className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-foreground sm:text-base">{doc}</span>
              </li>
            ))}
          </ul>

          <p className="mt-7 flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              The current TECH-UP intake accepts supporting document uploads with a maximum file
              size of 10 MB per relevant upload field.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
