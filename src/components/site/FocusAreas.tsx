import { GraduationCap, Laptop, Printer } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";

const pillars = [
  {
    icon: GraduationCap,
    title: "Tertiary Intake & Academic Admissions Support",
    body: "Structured intake programmes that help matriculants and pre-matric youth navigate higher education admissions.",
    points: [
      "Career guidance and qualification matching based on academic performance (APS scores).",
      "Document digitisation — scanning and certifying ID documents, academic reports and proof of residence.",
      "End-to-end online submissions for universities, TVET colleges and bursaries.",
    ],
  },
  {
    icon: Laptop,
    title: "Digital Literacy & 4IR Skills Training",
    body: "Hands-on community workshops that build practical digital capability.",
    points: [
      "Fundamental computer literacy, document processing and internet navigation.",
      "Practical technical skills, foundational programming concepts and digital workplace productivity tools.",
      "Preparing rural youth to participate actively in the digital economy.",
    ],
  },
  {
    icon: Printer,
    title: "Commercial Services & Sustainability",
    body: "Professional local services that keep us financially sustainable and fund our non-profit educational mandate.",
    points: [
      "High-volume printing, scanning and document management.",
      "Graphic design and digital administration.",
      "Local IT and hardware support for schools, small businesses and community members.",
    ],
  },
];

export function FocusAreas() {
  return (
    <section id="what-we-do" className="scroll-mt-24 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">What we do</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Our Three Core Pillars</h2><p className="mt-4 text-sm text-muted-foreground">Sign in or create an account to request assistance and track the progress of your service enquiry.</p></Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 80} className="group flex flex-col rounded-2xl border border-border/80 bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-turquoise/40 hover:shadow-soft">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-brand-turquoise/15"><pillar.icon className="size-5" aria-hidden="true" /></span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              <ul className="mt-5 space-y-2.5 border-t border-border/70 pt-5">{pillar.points.map((point) => <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-lime" />{point}</li>)}</ul>
              <Link to="/services" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90">Request this service</Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
