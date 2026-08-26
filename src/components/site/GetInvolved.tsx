import { HeartHandshake, ShieldCheck, Wrench } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { ORG } from "@/lib/site";

const qualities = [
  {
    icon: HeartHandshake,
    title: "Community-First Mindset",
    body: "A genuine passion for youth empowerment and rural community upliftment.",
  },
  {
    icon: Wrench,
    title: "Practical Problem Solving",
    body: "Willingness to be resourceful, communicative and dependable.",
  },
  {
    icon: ShieldCheck,
    title: "Collaboration & Respect",
    body: "High integrity when handling applicant documents, student records and community relationships.",
  },
];

export function GetInvolved() {
  return (
    <section id="get-involved" className="scroll-mt-24 bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">
            Get involved
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            What We Look For in Volunteers, Mentors & Staff
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            When you join TECH-UP, you are not just taking on tasks — you are helping build digital
            infrastructure for rural youth.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {qualities.map((quality, index) => (
            <Reveal
              as="li"
              key={quality.title}
              delay={index * 80}
              className="rounded-2xl border border-border/80 bg-card p-7"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <quality.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{quality.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{quality.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120} className="mt-10">
          <p className="text-sm text-muted-foreground">
            Interested in joining us? Email{" "}
            <a
              href={`mailto:${ORG.email}`}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {ORG.email}
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
