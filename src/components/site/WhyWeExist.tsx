import { BookOpen, Cpu, Wifi } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";

const gaps = [
  {
    icon: Wifi,
    title: "The Access Gap",
    body: "Lack of stable internet, modern computing equipment and digital tools.",
  },
  {
    icon: BookOpen,
    title: "The Information & Opportunity Gap",
    body: "Missed university and TVET admission deadlines, limited guidance on bursary applications such as NSFAS and corporate schemes, and difficulty digitising required documents.",
  },
  {
    icon: Cpu,
    title: "The 4IR Skills Gap",
    body: "Limited exposure to practical digital literacy, software tools, coding fundamentals and the technical problem solving the modern economy expects.",
  },
];

export function WhyWeExist() {
  return (
    <section id="why-we-exist" className="relative scroll-mt-24 overflow-hidden bg-brand-ink text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-green/15 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.22em] text-brand-lime uppercase">
              Why we exist
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              The Barriers We Work to Remove
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/85">
              In many rural and semi-rural communities, bright and capable youth face critical
              structural barriers.
            </p>
            <figure className="mt-8 border-l-2 border-brand-gold pl-5">
              <blockquote className="text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
                Our mission: to ensure that a student&rsquo;s geographic location never limits their
                academic potential, technical capability, or economic future.
              </blockquote>
            </figure>
          </Reveal>

          <Reveal delay={100} as="ul" className="space-y-4">
            {gaps.map((gap) => (
              <li
                key={gap.title}
                className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-foreground/10 text-brand-lime">
                  <gap.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{gap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75">{gap.body}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
